const Customer = require('../models/customer.model');
const Order = require('../models/order.model');
const Campaign = require('../models/campaign.model');
const MessageLog = require('../models/messageLog.model');

exports.getDashboardStats = async (req, res) => {
  try {
   
    const totalCustomers = await Customer.countDocuments();

    //here i am taking the recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'name email');

    // Get active campaigns
    const activeCampaigns = await Campaign.find({
      status: { $in: ['scheduled', 'sending'] }
    })
    .populate('segmentId', 'name')
    .sort({ scheduledFor: 1 });

    
    // Get customer activity summary
    const customerActivity = await Customer.aggregate([
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
          name: 1,
          email: 1,
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.totalAmount' },
          lastOrderDate: { $max: '$orders.createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalCustomers,
      recentOrders,
      activeCampaigns,
      topCustomers: customerActivity
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
 