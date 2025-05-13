const mongoose = require('mongoose');
const Segment = require('../models/segment.model');
const Customer = require('../models/customer.model');



exports.createSegment = async (req, res) => {
  try {
    const { name, description, rules, logicalOperator } = req.body;

    console.log('Creating segment with rules:', JSON.stringify(rules));
    console.log('Logical operator:', logicalOperator);

    // Build the query based on rules
    let query = {};
    if (rules && rules.length > 0) {
      const conditions = rules.map(rule => {
        const { field, operator, value } = rule;
        
        // Handle different field types appropriately
        const processedValue = field === 'totalSpent' ? Number(value) : value;
        
        switch (operator) {
          case '>':
            return { [field]: { $gt: processedValue } };
          case '<':
            return { [field]: { $lt: processedValue } };
          case '>=':
            return { [field]: { $gte: processedValue } };
          case '<=':
            return { [field]: { $lte: processedValue } };
          case '==':
            return { [field]: processedValue };
          case '!=':
            return { [field]: { $ne: processedValue } };
          default:
            return {};
        }
      });

      console.log('Generated conditions:', JSON.stringify(conditions));
      
      // Apply logical operator (AND/OR)
      if (logicalOperator === 'OR') {
        query = { $or: conditions };
      } else {
        query = { $and: conditions };
      }
      
      console.log('Final query:', JSON.stringify(query));
    }

    // Find customers matching the rules
    const customers = await Customer.find(query);
    console.log(`Found ${customers.length} matching customers`);
    
    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No customers match the specified rules'
      });
    }

    // Create the segment
    const segment = new Segment({
      name,
      description,
      rules,
      logicalOperator: logicalOperator || 'AND',
      customerIds: customers.map(c => c._id),
      estimatedSize: customers.length,
      createdBy: req.user.id
    });

    await segment.save();

    res.status(201).json({
      success: true,
      data: {
        ...segment.toObject(),
        customerCount: customers.length
      }
    });
  } catch (error) {
    console.error('Segment creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


exports.getSegments = async (req, res) => {
  try {
    const segments = await Segment.find()
      .select('name description estimatedSize rules');
    
    res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



exports.getSegmentMembers = async (req, res) => {
  try {
    const segment = await Segment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: 'Segment not found'
      });
    }

    // Get customers with their order information
    const customers = await Customer.aggregate([
      { $match: { _id: { $in: segment.customerIds } } },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'customerId',
          as: 'orders'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          phone: 1,
          address: 1,
          totalSpent: 1,
          totalOrders: { $size: '$orders' },
          averageOrderValue: { 
            $cond: [
              { $eq: [{ $size: '$orders' }, 0] },
              0,
              { $divide: ['$totalSpent', { $size: '$orders' }] }
            ]
          },
          lastOrderDate: { $max: '$orders.createdAt' },
          firstOrderDate: { $min: '$orders.createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        segment: {
          name: segment.name,
          description: segment.description,
          estimatedSize: segment.estimatedSize,
          rules: segment.rules,
          logicalOperator: segment.logicalOperator
        },
        customers,
        totalCustomers: customers.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};