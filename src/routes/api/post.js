const contentType = require('content-type');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      logger.warn('Request body is not a buffer');
      return res.status(415).json(createErrorResponse(415, 'Invalid content type'));
    }

    const { type } = contentType.parse(req);
    if (!Fragment.isSupportedType(type)) {
      logger.warn(`Unsupported content type: ${type}`);
      return res.status(415).json(createErrorResponse(415, `Unsupported content type: ${type}`));
    }

    const ownerId = req.user;
    const fragment = new Fragment({ ownerId, type });
    await fragment.save();
    await fragment.setData(req.body);

    const location = `${process.env.API_URL || `http://${req.headers.host}`}/fragments/${fragment.id}`;
    logger.info(`Fragment created: ${fragment.id}`);

    res.status(201).location(location).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error('Error creating fragment', err);
    res.status(500).json(createErrorResponse(500, 'Internal Server Error'));
  }
};
