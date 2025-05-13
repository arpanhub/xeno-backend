const mongoose = require('mongoose');

const messageLogSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  sentAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound index for efficient querying
messageLogSchema.index({ campaignId: 1, customerId: 1 });

module.exports = mongoose.model('MessageLog', messageLogSchema); 