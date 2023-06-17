import express from 'express';
import dishController from '../../controllers/dishController.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import dishSchema from '../../schemas/dishSchema.js';
import { config } from '../../config/index.js';

const dishRouter = express.Router();

dishRouter.get('/', authJwtHandler(config.accessSecret), dishController.getAllDishes);

dishRouter.get(
  '/:dishId',
  authJwtHandler(config.accessSecret),
  schemaHandler(dishSchema.schemaParams, 'params'),
  dishController.getOneDish
);

dishRouter.post(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(dishSchema.schemaBodyCreate, 'body'),
  dishController.createNewDish
);

dishRouter.patch(
  '/:dishId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(dishSchema.schemaParams, 'params'),
  schemaHandler(dishSchema.schemaBodyUpdate, 'body'),
  dishController.updateOneDish
);

dishRouter.delete(
  '/:dishId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(dishSchema.schemaParams, 'params'),
  dishController.deleteOneDish
);

export default dishRouter;
