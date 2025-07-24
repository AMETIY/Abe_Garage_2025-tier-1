// * table installation route

//` import express
const express = require('express');

// ` call router method from express to create routes
const router = express.Router();

// ` import install controller
const installController = require('../controllers/install.controller');

// ` create route for install page
router.get('/install', installController.install);
// ` export router

module.exports = router;