const express = require('express');
const { db, auth } = require('../db_config/dbConfig'); 
const router = express.Router();
const axios = require('axios');


router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, role } = req.body;

    if (!email || !password || !firstName || !lastName || !dateOfBirth || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    const uid = userRecord.uid;

    const userDoc = {
      uid,
      email,
      firstName,
      lastName,
      dateOfBirth,
      role
    };

    await db.collection('users').doc(uid).set(userDoc);

    res.status(201).json({ message: 'User created successfully', uid });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password, selectedRole } = req.body;

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const { idToken, email: userEmail, localId } = response.data; 

    const userDoc = await db.collection('users').doc(localId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found in Firestore' });
    }

    const userData = userDoc.data();

    if (userData.role !== selectedRole) {
      return res.status(403).json({ error: 'Role mismatch: unauthorized access' });
    }

    res.status(200).json({
      message: 'Login successful',
      token: idToken,
      role: userData.role,
      email: userEmail,
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`,
      {
        requestType: 'PASSWORD_RESET',
        email: email,
      }
    );

    if (response.status === 200) {
      res.status(200).json({ message: 'Password reset email sent successfully' });
    } else {
      throw new Error('Failed to send password reset email');
    }
  } catch (err) {
    console.error('Error sending password reset email:', err.message);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.user.uid;
    const userDoc = await getDocumentById(userId);

    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(userDoc);
  } catch (error) {
    console.error('Error fetching user details:', error.message);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

module.exports = router;
