const { getDocumentById } = require('../services/firestoreService');

const checkOrderOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const userDoc = await getDocumentById("users", userId);

    if (!userDoc || !userDoc.role) {
      return res.status(403).json({ error: "Access denied: Unable to determine user role" });
    }

    const userRole = userDoc.role;

    if (userRole === "admin") {
      return next();
    }

    const order = await getDocumentById("orders", id);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized: You do not own this order" });
    }

    next();
  } catch (err) {
    console.error("Order ownership check error:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = checkOrderOwnership;
