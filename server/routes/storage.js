const express = require('express');
const multer = require('multer');
const { bucket } = require('../db_config/dbConfig');
const verifyToken = require('../middleware/verifyTokenMiddleware');
const checkRole = require('../middleware/roleCheckerMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/upload',
  verifyToken, 
  checkRole('admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const blob = bucket.file(`products/${Date.now()}-${file.originalname}`);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      blobStream.on('error', (err) => {
        console.error('Error uploading file:', err.message);
        res.status(500).json({ error: 'Failed to upload file' });
      });

      blobStream.on('finish', async () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        res.status(200).json({ message: 'File uploaded successfully', url: publicUrl });
      });

      blobStream.end(file.buffer);
    } catch (err) {
      console.error('Error handling upload:', err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
