const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  rules: [{
    field: {
      type: String,
      required: true
    },
    operator: {
      type: String,
      required: true,
      enum: ['>', '<', '>=', '<=', '==', '!=']
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  logicalOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND'
  },
  customerIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  estimatedSize: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Segment', segmentSchema); 