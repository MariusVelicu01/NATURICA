const express = require("express");
const { db, auth } = require("../db_config/dbConfig");
const router = express.Router();
const axios = require("axios");
const verifyToken = require("../middleware/verifyTokenMiddleware");

router.post("/signup", async (req, res) => {
  try {
    const { email, password, firstName, lastName, dateOfBirth, role } =
      req.body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !role
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    if (age < 16) {
      return res
        .status(400)
        .json({ error: "User must be at least 16 years old." });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${firstName} ${lastName}`,
    });

    if (!userRecord) {
      return res.status(500).json({ error: "Failed to create user record" });
    }

    const uid = userRecord.uid;

    const userDoc = {
      uid,
      email,
      firstName,
      lastName,
      dateOfBirth,
      role,
    };

    await db.collection("users").doc(uid).set(userDoc);

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    if (!response || !response.data.idToken) {
      return res
        .status(500)
        .json({ error: "Failed to retrieve authentication token" });
    }

    const { idToken } = response.data;

    res.status(201).json({
      message: "User created successfully",
      userID: uid,
      token: idToken,
    });
  } catch (err) {
    console.error("Error creating user:", err.message, err.status);
    res.status(500).json({ error: err.message || "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
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

    const userDoc = await db.collection("users").doc(localId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found in Firestore" });
    }

    const userData = userDoc.data();

    if (userData.role !== selectedRole) {
      return res
        .status(403)
        .json({ error: "Role mismatch: unauthorized access" });
    }

    res.status(200).json({
      message: "Login successful",
      token: idToken,
      role: userData.role,
      email: userEmail,
      userId: localId,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(401).json({ error: "Invalid email or password" });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${process.env.FIREBASE_API_KEY}`,
      {
        requestType: "PASSWORD_RESET",
        email: email,
      }
    );

    if (response.status !== 200) {
      return res
        .status(500)
        .json({ error: "Failed to send password reset email" });
    }

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (err) {
    console.error("Error sending password reset email:", err.message);
    res.status(500).json({ error: "Failed to send password reset email" });
  }
});

router.post("/extract_uid", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email,
        password,
      }
    );

    const { localId } = response.data;

    if (!localId) {
      return res.status(404).json({ error: "User id not found" });
    }

    res.status(200).json({ localId });
  } catch (error) {
    console.error("Error fetching user details:", error.message);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

router.get("/getUserRole", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    console.log(userId);
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.json({ role: userData.role });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
