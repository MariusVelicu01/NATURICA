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

router.use(verifyToken);

const COLLECTION_NAME = 'conditions';

router.get('/', checkRole('client'), async (req, res) => {
  try {
    const data = await getAllDocuments(COLLECTION_NAME);
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching conditions:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', checkRole('client'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getDocumentById(COLLECTION_NAME, id);
    if (!data) {
      return res.status(404).json({ error: 'Condition not found' });
    }
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching condition:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', checkRole('admin'), async (req, res) => {
  try {
    const { name, symptoms } = req.body;

    if (!name || !symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Name and symptoms array are required' });
    }

    const docRef = await addDocument(COLLECTION_NAME, {
      name,
      symptoms
    });

    res.status(201).json({ id: docRef.id, message: 'Condition added successfully' });
  } catch (err) {
    console.error('Error adding condition:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symptoms } = req.body;

    if (!name || !symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Name and symptoms array are required' });
    }

    const result = await updateDocument(COLLECTION_NAME, id, {
      name,
      symptoms
    });

    res.status(200).json(result);
  } catch (err) {
    console.error('Error updating condition:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteDocument(COLLECTION_NAME, id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting condition:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
