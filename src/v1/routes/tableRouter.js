import express from 'express';
import tableController from '../../controllers/tableController.js';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import tableSchema from '../../schemas/tableSchema.js';
import { config } from '../../config/index.js';

const tableRouter = express.Router();

tableRouter.get('/', tableController.getAllTables);

tableRouter.get('/:tableId', schemaHandler(tableSchema.schemaParams, 'params'), tableController.getOneTable);

tableRouter.post(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(tableSchema.schemaBody, 'body'),
  tableController.createNewTable
);

tableRouter.patch(
  '/:tableId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(tableSchema.schemaParams, 'params'),
  schemaHandler(tableSchema.schemaBody, 'body'),
  tableController.updateOneTable
);

tableRouter.delete(
  '/:tableId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(tableSchema.schemaParams, 'params'),
  tableController.deleteOneTable
);

export default tableRouter;
