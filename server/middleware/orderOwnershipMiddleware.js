const { getDocumentById } = require('../services/firestoreService');

const checkOrderOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.email.endsWith('@admin.com') ? 'admin' : 'client';

    if (userRole === 'admin') {
      return next();
    }

    const order = await getDocumentById('orders', id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Unauthorized: You do not own this order' });
    }

    next();
  } catch (err) {
    console.error('Order ownership check error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = checkOrderOwnership;
