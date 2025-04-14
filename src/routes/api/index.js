// src/routes/api/index.js

/**
 * The main entry-point for the v1 version of the fragments API.
 */
const express = require('express');
const rawBody = require('../../raw-body');
const { getFragments, getFragmentById, getFragmentInfo } = require('./get');
const { deleteFragment } = require('./delete');
// Create a router on which to mount our API endpoints
const router = express.Router();

router.post('/fragments', rawBody(), require('./post'));

router.put('/fragments/:id', rawBody(), require('./put'));

router.get('/fragments', getFragments);
router.get('/fragments/:id', getFragmentById);
router.get('/fragments/:id/info', getFragmentInfo);

router.delete('/fragments/:id', deleteFragment);

module.exports = router;
