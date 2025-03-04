// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
const getFragments = async (req, res) => {
  const ownerId = req.user; // Authenticated user (hashed email)
  const expand = req.query.expand;
  try {
    logger.debug(`Fetching fragments for user: ${ownerId}`);

    // Retrieve list of fragment IDs
    if (!expand) {
      const fragments = await Fragment.byUser(ownerId, false);
      res.status(200).json(createSuccessResponse({ fragments }));
    } else {
      const fragments = await Fragment.byUser(ownerId, true);
      res.status(200).json(createSuccessResponse({ fragments }));
    }
  } catch (err) {
    logger.error(`Error fetching fragments for user ${ownerId}: ${err.message}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};

const getFragmentById = async (req, res) => {
  const ownerId = req.user; // Authenticated user (hashed email)
  const id = req.params.id; // Fragment ID from URL

  try {
    logger.debug(`Fetching fragment with ID: ${id} for user: ${ownerId}`);

    // Retrieve fragment metadata
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    // Only allow `text/plain` retrieval
    if (fragment.type !== 'text/plain') {
      logger.warn(`Fragment ID ${id} is not text/plain, cannot retrieve`);
      return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
    }

    // Retrieve fragment data
    const data = await fragment.getData();

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).json(createSuccessResponse({ fragment: data.toString() }));
  } catch (err) {
    logger.error(`Error fetching fragment ${id} for user ${ownerId}: ${err.message}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};

const getFragmentInfo = async (req, res) => {
  const ownerId = req.user; // Authenticated user (hashed email)
  const id = req.params.id; // Fragment ID from URL

  try {
    logger.debug(`Fetching metadata for fragment ID: ${id} for user: ${ownerId}`);

    // Retrieve fragment metadata
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn(`Fragment metadata not found: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Return fragment metadata
    res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error(`Error fetching metadata for fragment ${id} for user ${ownerId}: ${err.message}`);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};

module.exports = {
  getFragments,
  getFragmentById,
  getFragmentInfo,
};
