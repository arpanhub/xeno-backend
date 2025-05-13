const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const segmentController = require('../controllers/segment.controller');
const auth = require('../middleware/auth.middleware');


const validateSegment = [
  body('name').trim().notEmpty().withMessage('Segment name is required'),
  body('rules').isArray().withMessage('Rules must be an array'),
  body('rules.*.field').notEmpty().withMessage('Rule field is required'),
  body('rules.*.operator').isIn(['>', '<', '>=', '<=', '==', '!=']).withMessage('Invalid operator'),
  body('rules.*.value').exists().withMessage('Rule value is required')
];


router.get('/', auth, segmentController.getSegments);


router.get('/:id/members', auth, segmentController.getSegmentMembers);


router.post('/', auth, validateSegment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  segmentController.createSegment(req, res);
});




module.exports = router; 