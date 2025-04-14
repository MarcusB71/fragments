const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const id = req.params.id;
  const ownerId = req.user;
  const body = req.body;
  const type = req.get('Content-Type');

  logger.info({ id, ownerId, type }, `Calling PUT req on: ${req.originalUrl}`);

  try {
    const fragment = await Fragment.byId(ownerId, id);
    if (fragment.type == type) {
      await fragment.setData(body);

      logger.info(`Fragment updated: ${fragment.id}`);

      res.status(200).json(createSuccessResponse({ fragment }));
    } else {
      res.status(400).json(createErrorResponse(400, 'Fragment type must be the same.'));
      logger.error('failed to update fragment');
    }
  } catch (err) {
    logger.error('Error creating fragment', err);
    res.status(404).json(createErrorResponse(404, 'Failed to update fragment'));
  }
};
