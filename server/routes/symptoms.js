const express = require('express');
const router = express.Router();
const {
  addDocument, getAllDocuments, getDocumentById, updateDocument, deleteDocument
} = require('../services/firestoreService');
const verifyToken = require('../middleware/verifyTokenMiddleware');
const checkRole = require('../middleware/roleCheckerMiddleware');
const {
    validateSymptomOnDelete,
    validateSymptomOnUpdate,
    validateSymptomOnCreate
  } = require('../middleware/validateSymptomsMiddleware');

router.use(verifyToken);

const COLLECTION_NAME = 'symptoms';

router.get('/', checkRole('client'), async (req, res) => {
  try {
    const data = await getAllDocuments(COLLECTION_NAME)
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', checkRole('client'), async (req, res) => {
  try {
    const {id} = req.params;
    const data = await getDocumentById(COLLECTION_NAME,id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', checkRole('admin'), validateSymptomOnCreate, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const docRef = await addDocument(COLLECTION_NAME,{ name });
    res.status(201).json({ id: docRef.id, message: 'Succes' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', checkRole('admin'), validateSymptomOnUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await updateDocument(COLLECTION_NAME, id, data);
    res.status(200).json(result);
  } catch (err) {
    console.error('Update Error:', err.message);
    res.status(404).json({ error: err.message });
  }
});

router.delete('/:id', checkRole('admin'), validateSymptomOnDelete, async (req, res) => {
  try {
    const {id} = req.params;
    const result = await deleteDocument(COLLECTION_NAME,id);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;