const express = require('express');
const router = express.Router();
const googleController = require('../controllers/google.Controller');

router.post('/google',googleController);

module.exports=router;