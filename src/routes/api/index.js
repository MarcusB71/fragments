// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const rawBody = require('../../raw-body');
const { getFragments, getFragmentById, getFragmentInfo } = require('./get');

// Create a router on which to mount our API endpoints
const router = express.Router();

router.get('/fragments', getFragments);
router.get('/fragments/:id', getFragmentById);
router.get('/fragments/:id/info', getFragmentInfo);

router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
