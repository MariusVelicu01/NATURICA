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
  validateConditionOnDelete,
  validateConditionOnUpdate,
  validateConditionOnCreate
} = require('../middleware/validateConditionsMiddleware');

router.use(verifyToken);

const COLLECTION_NAME = 'conditions';

router.get('/', checkRole('client'), async (req, res) => {
  try {
    const conditions = await getAllDocuments(COLLECTION_NAME);
    const products = await getAllDocuments('products');

    const conditionsWithUsage = conditions.map((condition) => {
      const isUsed = products.some(
        (product) =>
          Array.isArray(product.conditionsTreated) &&
          product.conditionsTreated.some(conditionFormProduct => condition.id === conditionFormProduct.id)
      );
      return { ...condition, isUsed };
    });

    res.status(200).json(conditionsWithUsage);
  } catch (err) {
    console.error('Error fetching conditions:', err.message);
    res.status(500).json({ error: 'Failed to fetch conditions.' });
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

router.post('/', checkRole('admin'), validateConditionOnCreate, async (req, res) => {
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

router.put('/:id', checkRole('admin'), validateConditionOnUpdate, async (req, res) => {
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

router.delete('/:id', checkRole('admin'), validateConditionOnDelete, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteDocument(COLLECTION_NAME, id);
    res.status(200).json(result);
  } catch (err) {
    console.error('Error deleting condition:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post("/add-from-api", checkRole("admin"), async (req, res) => {
  try {
    const { conditions } = req.body;
    if (!conditions || conditions.length === 0) {
      return res.status(400).json({ error: "No conditions received." });
    }

    const existingConditions = await getAllDocuments("conditions");
    const existingNames = new Set(existingConditions.map(c => c.name.toLowerCase().trim()));

    let addedCount = 0;
    let skippedCount = 0;
    let addedConditions = [];
    let skippedConditions = [];

    for (const condition of conditions) {
      const conditionName = condition.toLowerCase().trim();

      if (existingNames.has(conditionName)) {
        skippedCount++;
        skippedConditions.push(condition);
      } else {
        await addDocument("conditions", { name: condition, symptoms: [] });
        addedCount++;
        addedConditions.push(condition); 
        existingNames.add(conditionName);
      }
    }

    return res.status(201).json({
      added: addedCount,
      skipped: skippedCount,
      addedConditions,
      skippedConditions
    });

  } catch (err) {
    console.error("Error adding conditions from API:", err.message);
    res.status(500).json({ error: "Failed to add conditions from API." });
  }
});

module.exports = router;
