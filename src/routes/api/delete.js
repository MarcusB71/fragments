const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

const deleteFragment = async (req, res) => {
  const ownerId = req.user;
  let id = req.params.id;

  try {
    logger.debug(`Deleting fragment with ID: ${id} for user: ${ownerId}`);

    // Retrieve fragment metadata
    const fragment = await Fragment.byId(ownerId, id);
    if (!fragment) {
      logger.warn(`Fragment not found: ${id}`);
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }
    await Fragment.delete(ownerId, id);

    res.status(200).json(createSuccessResponse(200, 'Fragment successfully deleted'));
  } catch (err) {
    logger.error(`Error fetching fragment ${id} for user ${ownerId}: ${err.message}`);
    res.status(404).json(createErrorResponse(404, 'Internal Server Error'));
  }
};

module.exports = {
  deleteFragment,
};
