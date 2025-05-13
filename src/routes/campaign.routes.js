const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const campaignController = require('../controllers/campaign.controller');
const auth = require('../middleware/auth.middleware');


const validateCampaign = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Campaign name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Campaign name must be between 3 and 100 characters'),
  
  body('segmentId')
    .isMongoId()
    .withMessage('Valid segment ID is required'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Scheduled date must be in the future');
      }
      return true;
    })
];


const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'sending', 'completed', 'failed'])
    .withMessage('Invalid status value'),
  
  query('search')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search term must be at least 2 characters')
];


router.get('/', auth, validateQuery, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  campaignController.getCampaigns(req, res);
});

router.get('/:id/progress', auth, campaignController.getCampaignProgress);

router.post('/', auth, validateCampaign, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  campaignController.createCampaign(req, res);
});

router.post('/:id/start', auth, campaignController.startCampaign);


module.exports = router; 