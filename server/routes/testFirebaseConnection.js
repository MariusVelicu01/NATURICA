const express = require('express');
const { db } = require('../db_config/dbConfig');
const router = express.Router();
const {
  addDocument, getAllDocuments, getDocumentById, updateDocument, deleteDocument
} = require('../services/firestoreService');

router.get('/test-firestore', async (req, res) => {
  try {
    const data = await getAllDocuments('test')
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/test-firestore/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const data = await getDocumentById('test',id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/test-firestore', async (req, res) => {
  try {
    const { name } = req.body;
    const docRef = await addDocument('test',{ name, createdAt: new Date() });
    res.status(201).json({ id: docRef.id, message: 'Succes' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/test-firestore/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await updateDocument('test', id, data);
    res.status(200).json(result);
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(404).json({ error: err.message });
  }
});

router.delete('/test-firestore/:id', async (req, res) => {
  try {
    const {id} = req.params;
    const result = await deleteDocument('test',id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
