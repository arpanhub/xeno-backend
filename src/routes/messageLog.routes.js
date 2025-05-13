const express = require('express');
const router = express.Router();
const messageLogController = require('../controllers/messageLog.controller');
const auth = require('../middleware/auth.middleware');


router.get('/campaign/:campaignId', auth, async (req, res) => {
  try {
    const logs = await messageLogController.getCampaignMessageLogs(req.params.campaignId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router; 