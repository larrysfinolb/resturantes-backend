import express from 'express';
import customerController from '../../controllers/customerController.js';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import customerSchema from '../../schemas/customerSchema.js';
import { config } from '../../config/index.js';

const customerRouter = express.Router();

customerRouter.get(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  customerController.getAllCustomers
);

customerRouter.get(
  '/:customerId',
  authJwtHandler(config.accessSecret),
  schemaHandler(customerSchema.schemaParams, 'params'),
  customerController.getOneCustomer
);

customerRouter.get(
  '/:customerId/orders',
  authJwtHandler(config.accessSecret),
  schemaHandler(customerSchema.schemaParams, 'params'),
  customerController.getAllOrdersByCustomer
);

customerRouter.get(
  '/:customerId/payments',
  authJwtHandler(config.accessSecret),
  schemaHandler(customerSchema.schemaParams, 'params'),
  customerController.getAllPaymentsByCustomer
);

export default customerRouter;
