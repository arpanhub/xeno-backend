const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Customer = require('../models/customer.model');
const auth = require('../middleware/auth.middleware');

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching customers'
    });
  }
});

module.exports = router; 