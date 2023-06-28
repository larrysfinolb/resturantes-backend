import express from 'express';
import categoryController from '../../controllers/categoryController.js';
import categorySchema from '../../schemas/categorySchema.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { config } from '../../config/index.js';

const categoryRouter = express.Router();

categoryRouter.get('/', authJwtHandler(config.accessSecret), categoryController.getAllCategories);

categoryRouter.get(
  '/:categoryId',
  authJwtHandler(config.accessSecret),
  schemaHandler(categorySchema.schemaParams, 'params'),
  categoryController.getOneCategory
);

categoryRouter.post(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(categorySchema.schemaBodyCreate, 'body'),
  categoryController.createNewCategory
);

categoryRouter.patch(
  '/:categoryId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(categorySchema.schemaParams, 'params'),
  schemaHandler(categorySchema.schemaBodyUpdate, 'body'),
  categoryController.updateOneCategory
);

categoryRouter.delete(
  '/:categoryId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(categorySchema.schemaParams, 'params'),
  categoryController.deleteOneCategory
);

categoryRouter.get(
  '/:categoryId/dishes',
  authJwtHandler(config.accessSecret),
  schemaHandler(categorySchema.schemaParams, 'params'),
  categoryController.getAllDishesByCategory
);

export default categoryRouter;
