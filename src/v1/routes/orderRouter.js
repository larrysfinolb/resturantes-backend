import express from 'express';
import orderController from '../../controllers/orderController.js';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { config } from '../../config/index.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import orderSchema from '../../schemas/orderSchema.js';

const ordersRouter = express.Router();

ordersRouter.get('/', authJwtHandler(config.accessSecret), orderController.getAllOrders);

ordersRouter.get(
  '/:orderId',
  authJwtHandler(config.accessSecret),
  schemaHandler(orderSchema.schemaParams, 'params'),
  orderController.getOneOrder
);

ordersRouter.post(
  '/',
  authJwtHandler(config.accessSecret),
  authRoleHandler('customer'),
  schemaHandler(orderSchema.schemaBodyCreate, 'body'),
  orderController.createNewOrder
);

export default ordersRouter;
