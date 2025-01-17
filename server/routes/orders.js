const express = require('express');
const router = express.Router();
const {
  addDocument,
  getAllDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument
} = require('../services/firestoreService');
const verifyToken = require('../middleware/verifyTokenMiddleware');
const checkOrderOwnership = require('../middleware/orderOwnershipMiddleware');

router.use(verifyToken);

const COLLECTION_NAME = 'orders';

router.get('/', async (req, res) => {
    try {
      const userRole = req.user.email.endsWith('@admin.com') ? 'admin' : 'client';
  
      if (userRole === 'admin') {
        const data = await getAllDocuments(COLLECTION_NAME);
        return res.status(200).json(data);
      }
  
      if (userRole === 'client') {
        const allOrders = await getAllDocuments(COLLECTION_NAME);
        const userOrders = allOrders.filter(order => order.userId === req.user.uid);
        return res.status(200).json(userOrders);
      }
  
      return res.status(403).json({ error: 'Access denied' });
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

router.get('/:id', checkOrderOwnership, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getDocumentById(COLLECTION_NAME, id);
    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching order:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
    try {
      const { productsOrdered } = req.body;
      const userId = req.user && req.user.uid ? req.user.uid : undefined;
  
      if (!productsOrdered || !Array.isArray(productsOrdered)) {
        return res.status(400).json({ error: 'Products are required to place an order' });
      }
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID is required' });
      }
  
      const fullOrderDetails = [];
      let totalValue = 0;
  
      for (const product of productsOrdered) {
        const { productId, quantity } = product;
  
        if (!productId || !quantity || quantity <= 0) {
          return res.status(400).json({ error: `Invalid product data: ${JSON.stringify(product)}` });
        }
  
        const productDoc = await getDocumentById('products', productId);
  
        if (!productDoc) {
          return res.status(404).json({ error: `Product with ID ${productId} not found` });
        }
  
        const { name, price, stock } = productDoc;
  
        if (quantity > stock) {
          return res.status(400).json({ error: `Not enough stock for product ${name}. Available: ${stock}` });
        }
  
        const subtotal = price * quantity;
        totalValue += subtotal;
  
        fullOrderDetails.push({
          productId,
          name,
          quantity,
          price,
          subtotal,
        });
      }
  
      for (const product of fullOrderDetails) {
        const { productId, quantity } = product;
        const productFromDatabase = await getDocumentById('products',productId);
  
        await updateDocument('products', productId, {
          stock: productFromDatabase.stock - quantity,
          productStatistics: productFromDatabase.productStatistics + quantity,
        });
      }
  
      const docRef = await addDocument('orders', {
        userId,
        productsOrdered: fullOrderDetails,
        totalValue,
        createdAt: new Date(),
        status: 'pending',
      });
  
      res.status(201).json({ id: docRef.id, message: 'Order placed successfully', details: fullOrderDetails });
    } catch (err) {
      console.error('Error creating order:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  
  

  router.put('/:id', checkOrderOwnership, async (req, res) => {
    try {
      const { id } = req.params;
      const { productsOrdered } = req.body;
  
      if (!productsOrdered || !Array.isArray(productsOrdered)) {
        return res.status(400).json({ error: 'Products are required to update an order' });
      }
  
      const existingOrder = await getDocumentById(COLLECTION_NAME, id);
      if (!existingOrder) {
        return res.status(404).json({ error: `Order with ID ${id} not found` });
      }
  
      const previousProducts = existingOrder.productsOrdered;
  
      const updatedOrderDetails = [];
      let updatedTotalValue = 0;
  
      for (const product of productsOrdered) {
        const { productId, quantity } = product;
  
        if (!productId || !quantity || quantity <= 0) {
          return res.status(400).json({ error: `Invalid product data: ${JSON.stringify(product)}` });
        }
  
        const productDoc = await getDocumentById('products', productId);
  
        if (!productDoc) {
          return res.status(404).json({ error: `Product with ID ${productId} not found` });
        }
  
        const { name, price, stock } = productDoc;
  
        const previousProduct = previousProducts.find(p => p.productId === productId);
        const reservedQuantity = previousProduct ? previousProduct.quantity : 0;
  
        const effectiveStock = stock + reservedQuantity;
  
        if (quantity > effectiveStock) {
          return res.status(400).json({ error: `Not enough stock for product ${name}. Available: ${effectiveStock}` });
        }
  
        const subtotal = price * quantity;
        updatedTotalValue += subtotal;
  
        updatedOrderDetails.push({
          productId,
          name,
          quantity,
          price,
          subtotal,
        });
      }
  
      for (const prevProduct of previousProducts) {
        const productDoc = await getDocumentById('products', prevProduct.productId);
        if (productDoc) {
          const restoredStock = productDoc.stock + prevProduct.quantity;
          const restoredProductStatistics = productDoc.productStatistics - prevProduct.quantity;
          await updateDocument('products', prevProduct.productId, { 
            stock: restoredStock,
            productStatistics: restoredProductStatistics
          });
        }
      }
  
      for (const product of updatedOrderDetails) {
        const { productId, quantity } = product;
        const productFromDatabase = await getDocumentById('products', productId);
  
        await updateDocument('products', productId, {
          stock: productFromDatabase.stock - quantity,
          productStatistics: productFromDatabase.productStatistics + quantity,
        });
      }
  
      const result = await updateDocument(COLLECTION_NAME, id, {
        productsOrdered: updatedOrderDetails,
        totalValue: updatedTotalValue,
        updatedAt: new Date(),
      });
  
      res.status(200).json({ message: 'Order updated successfully', result });
    } catch (err) {
      console.error('Error updating order:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
  
  

router.delete('/:id', checkOrderOwnership, async (req, res) => {
  try {
    const { id } = req.params;

    const existingOrder = await getDocumentById(COLLECTION_NAME, id);
    if (!existingOrder) {
      return res.status(404).json({ error: `Order with ID ${id} not found` });
    }

    const previousProducts = existingOrder.productsOrdered;

    for (const prevProduct of previousProducts) {
      const productDoc = await getDocumentById('products', prevProduct.productId);
      if (productDoc) {
        const restoredStock = productDoc.stock + prevProduct.quantity;
        const restoredProductStatistics = productDoc.productStatistics - prevProduct.quantity;
        await updateDocument('products', prevProduct.productId, { 
          stock: restoredStock,
          productStatistics: restoredProductStatistics
       });
      }
    }

    const result = await deleteDocument(COLLECTION_NAME, id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting order:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
