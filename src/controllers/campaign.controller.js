const mongoose = require('mongoose');
const Campaign = require('../models/campaign.model');
const Segment = require('../models/segment.model');
const Customer = require('../models/customer.model');
const messageLogController = require('./messageLog.controller');


const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  res.status(500).json({ 
    success: false,
    message: `Error in ${context}: ${error.message}`,
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
};


exports.createCampaign = async (req, res) => {
  try {
    const { name, description, segmentId, message, scheduledFor } = req.body;
    
    // Verify segment exists and get its customers
    const segment = await Segment.findById(segmentId).populate('customerIds');
    if (!segment) {
      return res.status(404).json({ 
        success: false,
        message: 'Segment not found' 
      });
    }

    if (!segment.customerIds || segment.customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Segment has no customers'
      });
    }
    
    // Create the campaign
    const campaign = new Campaign({
      name,
      description,
      segmentId,
      message,
      scheduledFor,
      status: 'draft',
      totalRecipients: segment.customerIds.length,
      createdBy: req.user.id
    });
    
    await campaign.save();

    // Create message logs for each customer in the segment
    await messageLogController.createMessageLogs(
      campaign._id,
      segment.customerIds.map(c => c._id),
      message
    );

    console.log(`Campaign created successfully: ${campaign._id}`);
    res.status(201).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    handleError(res, error, 'createCampaign');
  }
};


exports.getCampaigns = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {};

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await Campaign.find(query)
      .populate('segmentId', 'name description estimatedSize')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Campaign.countDocuments(query);
    
    res.json({
      success: true,
      data: campaigns,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    handleError(res, error, 'getCampaigns');
  }
};


exports.startCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        message: 'Campaign not found' 
      });
    }

    // Validate campaign status
    if (campaign.status === 'sending' || campaign.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: `Campaign is already ${campaign.status}`
      });
    }

    // Check if campaign is scheduled for future
    if (campaign.scheduledFor && new Date(campaign.scheduledFor) > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign is scheduled for future date'
      });
    }

    // Verify segment has customers
    const segment = await Segment.findById(campaign.segmentId).populate('customerIds');
    if (!segment.customerIds || segment.customerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Segment has no customers'
      });
    }

    // Create message logs for each customer in the segment
    try {
      await messageLogController.createMessageLogs(
        campaign._id,
        segment.customerIds.map(c => c._id),
        campaign.message
      );
    } catch (error) {
      console.error('Error creating message logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create message logs: ' + error.message
      });
    }

    // Update campaign status
    campaign.status = 'sending';
    campaign.startedAt = new Date();
    campaign.totalRecipients = segment.customerIds.length;
    await campaign.save();

    // Get updated message logs and stats
    const messageLogs = await messageLogController.getCampaignMessageLogs(campaign._id);
    const stats = await messageLogController.getCampaignMessageStats(campaign._id);

    console.log(`Campaign started successfully: ${campaign._id}`);
    res.json({
      success: true,
      data: {
        ...campaign.toObject(),
        messageLogs,
        stats,
        message: 'Campaign started successfully. Messages will be sent to recipients.'
      }
    });
  } catch (error) {
    handleError(res, error, 'startCampaign');
  }
};

exports.getCampaignProgress = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('segmentId', 'name description estimatedSize')
      .populate('createdBy', 'name email');

    if (!campaign) {
      return res.status(404).json({ 
        success: false,
        message: 'Campaign not found' 
      });
    }
    
    // Get message logs and stats
    const messageLogs = await messageLogController.getCampaignMessageLogs(campaign._id);
    const stats = await messageLogController.getCampaignMessageStats(campaign._id);
    
    // Calculate progress percentage
    const progress = campaign.totalRecipients > 0 
      ? Math.round((stats.delivered / campaign.totalRecipients) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        campaign: {
          _id: campaign._id,
          name: campaign.name,
          status: campaign.status,
          totalRecipients: campaign.totalRecipients,
          startedAt: campaign.startedAt,
          scheduledFor: campaign.scheduledFor
        },
        progress: {
          percentage: progress,
          stats: {
            total: stats.total,
            sent: stats.sent,
            delivered: stats.delivered,
            failed: stats.failed,
            pending: stats.pending
          }
        },
        recentMessages: messageLogs.slice(0, 10) // Get last 10 messages
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

