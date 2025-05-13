const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Order = require('../models/order.model');
const Customer = require('../models/customer.model');
const auth = require('../middleware/auth.middleware');


router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().populate('customerId', 'name email');
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Create new order
router.post('/',
  auth,
  [
    body('customerId').isMongoId(),
    body('amount').isFloat({ min: 0 }),
    body('items').isArray(),
    body('items.*.name').trim().notEmpty(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('items.*.price').isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if customer exists
      const customer = await Customer.findById(req.body.customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const order = new Order(req.body);
      await order.save();

      // Update customer's total spent and last purchase date
      customer.totalSpent += order.amount;
      customer.lastPurchaseDate = new Date();
      await customer.save();

      res.status(201).json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating order'
      });
    }
  }
);

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('customerId', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Update order status
router.patch('/:id/status',
  auth,
  [
    body('status').isIn(['pending', 'completed', 'cancelled'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status: req.body.status },
        { new: true, runValidators: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating order status'
      });
    }
  }
);

module.exports = router; 