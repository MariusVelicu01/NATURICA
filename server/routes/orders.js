const express = require("express");
const router = express.Router();
const {
  addDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
} = require("../services/firestoreService");
const verifyToken = require("../middleware/verifyTokenMiddleware");
const checkOrderOwnership = require("../middleware/orderOwnershipMiddleware");

router.use(verifyToken);

const COLLECTION_NAME = "orders";

router.get("/", async (req, res) => {
  try {
    const userId = req.user.uid;

    const userDoc = await getDocumentById("users", userId);

    if (!userDoc || !userDoc.role) {
      return res
        .status(403)
        .json({ error: "Access denied: Unable to determine user role" });
    }

    const userRole = userDoc.role;

    if (userRole === "admin") {
      const data = await getAllDocuments("orders");
      return res.status(200).json(data);
    }

    if (userRole === "client") {
      const allOrders = await getAllDocuments("orders");
      const userOrders = allOrders.filter((order) => order.userId === userId);
      return res.status(200).json(userOrders);
    }

    return res.status(403).json({ error: "Access denied" });
  } catch (err) {
    console.error("Error fetching orders:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", checkOrderOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getDocumentById(COLLECTION_NAME, id);
    if (!data) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { productsOrdered, query } = req.body;
    const userId = req.user && req.user.uid ? req.user.uid : undefined;

    if (
      !productsOrdered ||
      !Array.isArray(productsOrdered) ||
      productsOrdered.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Products are required to place an order" });
    }

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User ID is required" });
    }

    if (
      !query.name ||
      !query.address ||
      !query.city ||
      !query.postalCode ||
      !query.country ||
      !query.paymentMethod
    ) {
      return res
        .status(400)
        .json({ error: "All checkout details are required" });
    }

    const fullOrderDetails = [];
    let totalValue = 0;

    for (const product of productsOrdered) {
      const { productId, quantity } = product;

      if (!productId || !quantity || quantity <= 0) {
        return res
          .status(400)
          .json({ error: `Invalid product data: ${JSON.stringify(product)}` });
      }

      const productDoc = await getDocumentById("products", productId);

      if (!productDoc) {
        return res
          .status(404)
          .json({ error: `Product with ID ${productId} not found` });
      }

      const { name: productName, price, stock, imgSrc } = productDoc;

      if (quantity > stock) {
        return res.status(400).json({
          error: `Not enough stock for product ${productName}. Available: ${stock}`,
        });
      }

      const subtotal = price * quantity;
      totalValue += subtotal;

      fullOrderDetails.push({
        productId,
        name: productName,
        quantity,
        price,
        subtotal,
        imgSrc,
      });
    }

    for (const product of fullOrderDetails) {
      const { productId, quantity } = product;
      const productFromDatabase = await getDocumentById("products", productId);

      await updateDocument("products", productId, {
        stock: productFromDatabase.stock - quantity,
        productStatistics: productFromDatabase.productStatistics + quantity,
      });
    }

    const docRef = await addDocument("orders", {
      userId,
      fullName: query.name,
      address: query.address,
      city: query.city,
      postalCode: query.postalCode,
      country: query.country,
      paymentMethod: query.paymentMethod,
      productsOrdered: fullOrderDetails,
      totalValue,
      createdAt: new Date(),
      status: "pending",
    });

    res.status(201).json({
      id: docRef.id,
      message: "Order placed successfully",
      details: fullOrderDetails,
    });
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete(
  "/:id/product/:productId",
  checkOrderOwnership,
  async (req, res) => {
    try {
      const { id, productId } = req.params;

      const existingOrder = await getDocumentById(COLLECTION_NAME, id);
      if (!existingOrder) {
        return res.status(404).json({ error: `Order with ID ${id} not found` });
      }

      const previousProducts = existingOrder.productsOrdered || [];

      const productToDelete = previousProducts.find(
        (p) => p.productId === productId
      );
      if (!productToDelete) {
        return res
          .status(404)
          .json({
            error: `Product with ID ${productId} not found in this order.`,
          });
      }

      if (previousProducts.length === 1) {
        return res.status(400).json({
          error: "Cannot remove the only product from the order.",
        });
      }

      const productDoc = await getDocumentById("products", productId);
      if (!productDoc) {
        return res
          .status(404)
          .json({
            error: `Product with ID ${productId} not found in database.`,
          });
      }

      const restoredStock = productDoc.stock + productToDelete.quantity;
      const restoredProductStatistics =
        productDoc.productStatistics - productToDelete.quantity;

      await updateDocument("products", productId, {
        stock: restoredStock,
        productStatistics: restoredProductStatistics,
      });

      const updatedOrderDetails = previousProducts.filter(
        (p) => p.productId !== productId
      );

      let updatedTotalValue = 0;
      for (const product of updatedOrderDetails) {
        updatedTotalValue += product.price * product.quantity;
      }

      const updatedOrder = {
        productsOrdered: updatedOrderDetails,
        totalValue: updatedTotalValue,
        updatedAt: new Date(),
      };

      const result = await updateDocument(COLLECTION_NAME, id, updatedOrder);

      return res.status(200).json({
        message: "Product removed from the order successfully",
        result,
      });
    } catch (err) {
      console.error("Error removing product from order:", err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);

router.put("/:id/cancel", checkOrderOwnership, async (req, res) => {
  try {
    const { id } = req.params;

    const existingOrder = await getDocumentById(COLLECTION_NAME, id);
    if (!existingOrder) {
      return res.status(404).json({ error: `Order with ID ${id} not found` });
    }

    const previousProducts = existingOrder.productsOrdered || [];
    for (const prevProduct of previousProducts) {
      const productDoc = await getDocumentById(
        "products",
        prevProduct.productId
      );
      if (productDoc) {
        const restoredStock = productDoc.stock + prevProduct.quantity;
        const restoredProductStatistics =
          productDoc.productStatistics - prevProduct.quantity;
        await updateDocument("products", prevProduct.productId, {
          stock: restoredStock,
          productStatistics: restoredProductStatistics,
        });
      }
    }

    const updatedOrder = {
      status: "canceled",
      canceledAt: new Date(),
    };

    const result = await updateDocument(COLLECTION_NAME, id, updatedOrder);

    return res.status(200).json({
      message: "Order canceled successfully",
      result,
    });
  } catch (err) {
    console.error("Error canceling order:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
