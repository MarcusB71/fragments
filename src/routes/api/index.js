// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const rawBody = require('../../raw-body');
const { getFragments, getFragmentById } = require('./get');

// Create a router on which to mount our API endpoints
const router = express.Router();

router.get('/fragments', getFragments);
router.get('/fragments/:id', getFragmentById);

router.post('/fragments', rawBody(), require('./post'));

module.exports = router;
