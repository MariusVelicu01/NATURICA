const { getAllDocuments } = require('../services/firestoreService');

const validateSymptomOnDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conditions = await getAllDocuments('conditions');
    
    const isUsedInCondition = conditions.some(condition => 
      condition.symptoms && condition.symptoms.includes(id)
    );

    if (isUsedInCondition) {
      return res.status(400).json({ error: 'Cannot delete a symptom that is linked to a condition.' });
    }

    next();
  } catch (err) {
    console.error('Validation Error on Delete:', err.message);
    res.status(500).json({ error: 'Failed to validate symptom before delete.' });
  }
};

const validateSymptomOnUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name field is required for updating.' });
    }

    const conditions = await getAllDocuments('conditions');
    
    const isUsedInCondition = conditions.some(condition => 
      condition.symptoms && condition.symptoms.includes(id)
    );

    if (isUsedInCondition) {
      return res.status(400).json({ error: 'Cannot update a symptom that is linked to a condition.' });
    }

    next();
  } catch (err) {
    console.error('Validation Error on Update:', err.message);
    res.status(500).json({ error: 'Failed to validate symptom before update.' });
  }
};

const validateSymptomOnCreate = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name field is required.' });
    }

    const symptoms = await getAllDocuments('symptoms');
    const alreadyExists = symptoms.some(symptom => symptom.name === name);

    if (alreadyExists) {
      return res.status(400).json({ error: 'A symptom with this name already exists.' });
    }

    next();
  } catch (err) {
    console.error('Validation Error on Create:', err.message);
    res.status(500).json({ error: 'Failed to validate symptom before create.' });
  }
};

module.exports = {
  validateSymptomOnDelete,
  validateSymptomOnUpdate,
  validateSymptomOnCreate
};
