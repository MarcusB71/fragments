// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const sharp = require('sharp');
const { htmlToText } = require('html-to-text');

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
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};

const getFragmentById = async (req, res) => {
  const ownerId = req.user;
  let [id, ext] = req.params.id.split('.');

  try {
    logger.debug(`Fetching fragment with ID: ${id} for user: ${ownerId}`);

    // Retrieve fragment metadata
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    // Retrieve fragment data
    const data = await fragment.getData();

    // Handle conversion if extension is provided
    if (ext) {
      const extType = getExtensionContentType(ext);
      if (fragment.formats.includes(extType)) {
        const convertedData = await convertData(data, fragment.mimeType, ext);
        res.setHeader('Content-Type', extType);
        res.status(200).send(convertedData);
      } else {
        logger.warn(`Unsupported extension: ${ext}`);
        return res.status(415).json(createErrorResponse(415, 'Unsupported extension'));
      }
    } else {
      res.setHeader('Content-Type', fragment.type);
      return res.status(200).send(data);
    }
  } catch (err) {
    logger.error(`Error fetching fragment ${id} for user ${ownerId}: ${err.message}`);
    res.status(404).json(createErrorResponse(404, 'Fragment not found'));
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
    res.status(404).json(createErrorResponse(404, 'Fragment info not found'));
  }
};

const getExtensionContentType = (extension) => {
  switch (extension) {
    case 'txt':
      return 'text/plain';
    case 'md':
      return 'text/markdown';
    case 'html':
      return 'text/html';
    case 'json':
      return 'application/json';
    case 'png':
      return 'image/png';
    case 'jpg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return null;
  }
};

const convertData = async (data, from, to) => {
  let convertedData = data;
  switch (from) {
    case 'text/markdown':
      if (to == 'txt') {
        convertedData = md.render(data.toString());
        convertedData = htmlToText(convertedData.toString(), { wordwrap: 150 });
        break;
      }
      if (to === 'html') {
        convertedData = md.render(data.toString());
      }
      break;
    case 'text/html':
      if (to == 'txt') {
        convertedData = htmlToText(data.toString(), { wordwrap: 130 });
      }
      break;
    case 'application/json':
      if (to == 'txt') {
        convertedData = JSON.parse(data.toString());
      }
      break;
    case 'image/png':
      if (to == 'jpg') {
        convertedData = await sharp(data).jpeg().toBuffer();
      }
      if (to == 'webp') {
        convertedData = await sharp(data).webp().toBuffer();
      }
      if (to == 'gif') {
        convertedData = await sharp(data).gif().toBuffer();
      }
      break;
    case 'image/jpeg':
      if (to == 'png') {
        convertedData = await sharp(data).png().toBuffer();
      }
      if (to == 'webp') {
        convertedData = await sharp(data).webp().toBuffer();
      }
      if (to == 'gif') {
        convertedData = await sharp(data).gif().toBuffer();
      }
      break;
    case 'image/webp':
      if (to == 'png') {
        convertedData = await sharp(data).png().toBuffer();
      }
      if (to == 'jpg') {
        convertedData = await sharp(data).jpeg().toBuffer();
      }
      if (to == 'gif') {
        convertedData = await sharp(data).gif().toBuffer();
      }
      break;
    case 'image/gif':
      if (to == 'png') {
        convertedData = await sharp(data).png().toBuffer();
      }
      if (to == 'jpg') {
        convertedData = await sharp(data).jpeg().toBuffer();
      }
      if (to == 'webp') {
        convertedData = await sharp(data).webp().toBuffer();
      }
      break;
  }

  logger.debug(`Fragment data was successfully converted from ${from} to ${to}`);
  return Promise.resolve(convertedData);
};

module.exports = {
  getFragments,
  getFragmentById,
  getFragmentInfo,
};
