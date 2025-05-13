const mongoose = require('mongoose');
const MessageLog = require('../models/messageLog.model');
const Campaign = require('../models/campaign.model');





exports.createMessageLogs = async (campaignId, customerIds, message) => {
  try {
    // First, delete any existing logs for this campaign
    await MessageLog.deleteMany({ campaignId });

    // Create new logs
    const logs = customerIds.map(customerId => ({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      customerId: new mongoose.Types.ObjectId(customerId),
      message,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    if (logs.length === 0) {
      throw new Error('No customers to create message logs for');
    }

    const result = await MessageLog.insertMany(logs);
    console.log(`Created ${result.length} message logs for campaign ${campaignId}`);
    return result;
  } catch (error) {
    console.error('Error in createMessageLogs:', error);
    throw new Error(`Error creating message logs: ${error.message}`);
  }
};

exports.getCampaignMessageLogs = async (campaignId) => {
  try {
    return await MessageLog.find({ campaignId })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error('Error in getCampaignMessageLogs:', error);
    throw new Error(`Error fetching campaign message logs: ${error.message}`);
  }
};


exports.getCampaignMessageStats = async (campaignId) => {
  try {
    const stats = await MessageLog.aggregate([
      { $match: { campaignId: new mongoose.Types.ObjectId(campaignId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });

    return result;
  } catch (error) {
    console.error('Error in getCampaignMessageStats:', error);
    throw new Error(`Error fetching campaign message stats: ${error.message}`);
  }
}; 