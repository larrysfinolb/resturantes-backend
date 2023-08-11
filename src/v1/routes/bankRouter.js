import express from 'express';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { config } from '../../config/index.js';
import bankController from '../../controllers/bankController.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import bankSchema from '../../schemas/bankSchema.js';

const bankRouter = express.Router();

bankRouter.get('/', authJwtHandler(config.accessSecret), bankController.getAllBanks);

bankRouter.get(
  '/:bankId',
  authJwtHandler(config.accessSecret),
  schemaHandler(bankSchema.schemaParams, 'params'),
  bankController.getOneBank
);

bankRouter.post(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(bankSchema.schemaBodyCreate, 'body'),
  bankController.createNewBank
);

bankRouter.patch(
  '/:bankId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(bankSchema.schemaParams, 'params'),
  schemaHandler(bankSchema.schemaBodyUpdate, 'body'),
  bankController.updateOneBank
);

bankRouter.delete(
  '/:bankId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(bankSchema.schemaParams, 'params'),
  bankController.deleteOneBank
);

export default bankRouter;
