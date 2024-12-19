const express = require('express');
const router = express.Router();

router.get('/error-test', (req, res, next) => {
  const err = new Error("This is a test error");
  err.status = 418;
  next(err);
});

module.exports = router;