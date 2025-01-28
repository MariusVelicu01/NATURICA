const { getAllDocuments, getDocumentById } = require('../services/firestoreService');

const validateConditionOnDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const products = await getAllDocuments('products');
    
    const isUsedInProducts = products.some(product => 
      product.conditionsTreated && 
      product.conditionsTreated.some(condition => condition.id === id)
    );

    if (isUsedInProducts) {
      return res.status(400).json({ error: 'Cannot delete a condition that is linked to a product.' });
    }

    next();
  } catch (err) {
    console.error('Validation Error on Delete:', err.message);
    res.status(500).json({ error: 'Failed to validate condition before delete.' });
  }
};

const validateConditionOnUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, symptoms } = req.body;

    if (!name || !symptoms || !Array.isArray(symptoms)) {
      return res.status(400).json({ error: 'Name and symptoms are required for updating.' });
    }

    const products = await getAllDocuments('products');
    const isUsedInProducts = products.some(product => 
      product.conditionsTreated && 
      product.conditionsTreated.some(condition => condition.id === id)
    );

    const existingCondition = await getDocumentById('conditions', id);
    if (!existingCondition) {
      return res.status(404).json({ error: 'Condition not found.' });
    }

    if (isUsedInProducts) {
      if (existingCondition.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
        return res
          .status(400)
          .json({ error: 'Cannot update the name of a condition linked to a product.' });
      }
    }

    next();
  } catch (err) {
    console.error('Validation Error on Update:', err.message);
    res.status(500).json({ error: 'Failed to validate condition before update.' });
  }
};

const validateConditionOnCreate = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Condition name is required.' });
    }

    const conditions = await getAllDocuments('conditions');
    const alreadyExists = conditions.some(condition => condition.name.toLowerCase().trim() === name.toLowerCase().trim());

    if (alreadyExists) {
      return res.status(400).json({ error: 'A condition with this name already exists.' });
    }

    next();
  } catch (err) {
    console.error('Validation Error on Create:', err.message);
    res.status(500).json({ error: 'Failed to validate condition before create.' });
  }
};

module.exports = {
    validateConditionOnDelete,
    validateConditionOnUpdate,
    validateConditionOnCreate
};
