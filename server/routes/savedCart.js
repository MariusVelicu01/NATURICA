const express = require('express');
const router = express.Router();
const { getDocumentById, createOrUpdateDocument } = require('../services/firestoreService');
const verifyToken = require('../middleware/verifyTokenMiddleware');

router.use(verifyToken);

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await getDocumentById('carts', userId);
    res.json(cart || { cart: [] });
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { cart } = req.body;

  if (!Array.isArray(cart)) {
    return res.status(400).json({ error: 'Invalid cart data' });
  }

  try {
    await createOrUpdateDocument('carts', userId, { cart });
    res.status(200).json({ message: 'Cart saved successfully' });
  } catch (error) {
    console.error('Error saving cart:', error.message);
    res.status(500).json({ error: 'Failed to save cart' });
  }
});

module.exports = router;
