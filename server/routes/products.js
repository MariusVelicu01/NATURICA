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
const checkRole = require('../middleware/roleCheckerMiddleware');
const {
    validateProductOnDelete,
    validateProductName
  } = require('../middleware/validateProductsMiddleware');

router.use(verifyToken);

const COLLECTION_NAME = 'products';

router.get('/', checkRole('client'), async (req, res) => {
  try {
    const data = await getAllDocuments(COLLECTION_NAME);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', checkRole('client'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getDocumentById(COLLECTION_NAME, id);
    if (!data) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching product:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', checkRole('admin'), validateProductName, async (req, res) => {
  try {
    const { name, productDetails, conditionsTreated, stock, price, imgSrc } = req.body;
    const productStatistics = 0;

    if (!name || !productDetails || !conditionsTreated || !Array.isArray(conditionsTreated) || !stock || !price || !imgSrc) {
      return res.status(400).json({ error: 'All fields are required, including conditions treated.' });
    } else if (conditionsTreated.length === 0) {
      return res.status(400).json({ error: 'At least one condition must be selected.' });
    } else if (stock <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Stock and price must be greater than 0.' });
    }

    const docRef = await addDocument(COLLECTION_NAME, {
      name,
      productDetails,
      conditionsTreated,
      stock,
      price,
      imgSrc,
      productStatistics
    });

    res.status(201).json({ id: docRef.id, message: 'Product added successfully' });
  } catch (err) {
    console.error('Error adding product:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, productDetails, conditionsTreated, stock, price, imgSrc } = req.body;

    if (!name || !productDetails || !conditionsTreated || !Array.isArray(conditionsTreated) || !stock || !price || !imgSrc) {
      return res.status(400).json({ error: 'All fields are required, including conditions treated.' });
    } else if (conditionsTreated.length === 0) {
      return res.status(400).json({ error: 'At least one condition must be selected.' });
    } else if (stock <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Stock and price must be greater than 0.' });
    }

    const productBeforeUpdate = await getDocumentById(COLLECTION_NAME, id);

    if (!productBeforeUpdate) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const { productStatistics } = productBeforeUpdate;

    const result = await updateDocument(COLLECTION_NAME, id, {
        name,
        productDetails,
        conditionsTreated,
        stock,
        price,
        imgSrc,
        productStatistics
      });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error updating product:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', checkRole('admin'), validateProductOnDelete, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteDocument(COLLECTION_NAME, id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting product:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
