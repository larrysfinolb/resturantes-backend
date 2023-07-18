import express from 'express';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { config } from '../../config/index.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import paymentSchema from '../../schemas/paymentSchema.js';
import paymentController from '../../controllers/paymentController.js';

const paymentRouter = express.Router();

paymentRouter.get('/', authJwtHandler(config.accessSecret), authRoleHandler('admin'), paymentController.getAllPayments);

paymentRouter.get(
  '/:paymentId',
  authJwtHandler(config.accessSecret),
  schemaHandler(paymentSchema.schemaParams, 'params'),
  paymentController.getOnePayment
);

paymentRouter.post(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('customer'),
  schemaHandler(paymentSchema.schemaBodyCreate, 'body'),
  paymentController.createNewPayment
);

paymentRouter.patch(
  '/:paymentId',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(paymentSchema.schemaParams, 'params'),
  schemaHandler(paymentSchema.schemaBodyUpdate, 'body'),
  paymentController.updateOnePayment
);

export default paymentRouter;
