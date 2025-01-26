const { getAllDocuments } = require('../services/firestoreService');

const validateProductOnDelete = async (req, res, next) => {
    try {
      const { id } = req.params; 
      const orders = await getAllDocuments('orders');
  
      const isUsedInOrders = orders.some(order => 
        order.productsOrdered && order.productsOrdered.some(product => product.productId === id)
      );
  
      if (isUsedInOrders) {
        return res.status(400).json({ error: 'Cannot delete a product that is linked to an order.' });
      }
  
      next();
    } catch (err) {
      console.error('Validation Error on Delete:', err.message);
      res.status(500).json({ error: 'Failed to validate product before delete.' });
    }
  };
  

const validateProductName = async (req, res, next) => {
  try {
    const { name } = req.body;

    const products = await getAllDocuments('products');
    const alreadyExists = products.some(product => product.name.toLowerCase().trim() === name.toLowerCase().trim());

    if (alreadyExists) {
      return res.status(400).json({ error: 'A product with this name already exists.' });
    }

    next();
  } catch (err) {
    console.error('Validation Error on Update:', err.message);
    res.status(500).json({ error: 'Failed to validate symptom before update.' });
  }
};

module.exports = {
    validateProductOnDelete,
    validateProductName
};
