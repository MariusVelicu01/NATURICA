const { getAllDocuments, getDocumentById } = require('../services/firestoreService');

const validateSymptomOnDelete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conditions = await getAllDocuments('conditions');
    
    const isUsedInCondition = conditions.some(condition => 
      condition.symptoms && condition.symptoms.some(symptom => symptom.id === id)
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

    const existingSymptom = await getDocumentById('symptoms', id);
    if (!existingSymptom) {
      return res.status(404).json({ error: 'Symptom not found.' });
    }
    
    const isUsedInCondition = conditions.some(condition => 
      condition.symptoms && condition.symptoms.some(symptom => symptom.id === id)
    );

    if (isUsedInCondition) {
      if (existingSymptom.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
        return res
          .status(400)
          .json({ error: 'Cannot update the name of a symptom linked to a condition.' });
      }
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
    const alreadyExists = symptoms.some(symptom => symptom.name.toLowerCase().trim() === name.toLowerCase().trim());

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
