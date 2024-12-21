const express = require('express');
const { db } = require('../db_config/dbConfig');
const router = express.Router();

router.get('/test-firestore', async (req, res) => {
  try {
    const snapshot = await db.collection('test').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/test-firestore', async (req, res) => {
  try {
    const { name } = req.body;
    const docRef = await db.collection('test').add({ name, createdAt: new Date() });
    res.status(201).json({ id: docRef.id, message: 'Succes' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
