const { db } = require('../db_config/dbConfig');

const checkRole = (role) => {
  return async (req, res, next) => {
    try {
      const userUid = req.user.uid;

      if (!req.user || !userUid) {
        return res.status(403).json({ error: 'Unauthorized access' });
      }

      const userDoc = await db.collection('users').doc(userUid).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userData = userDoc.data();

      if (userData.role === 'admin') {
        return next();
      }

      if (userData.role === 'client') {
        return next();
      }

      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    } catch (error) {
      console.error('Error in checkRole middleware:', error.message);
      return res.status(500).json({ error: 'Failed to verify role' });
    }
  };
};

module.exports = checkRole;
