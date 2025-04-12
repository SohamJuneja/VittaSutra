const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Government Expenditure Tracker API',
    version: '1.0.0',
    status: 'active'
  });
});

module.exports = router; 