import express from 'express';
import authController from '../../controllers/authController.js';
import authSchema from '../../schemas/authSchema.js';
import { schemaHandler } from '../../middlewares/schemaHandler.js';
import { authJwtHandler, authRoleHandler } from '../../middlewares/authHandler.js';
import { config } from '../../config/index.js';

const authRouter = express.Router();

authRouter.post('/signup', schemaHandler(authSchema.signup, 'body'), authController.signup);

authRouter.get('/verify/:verifyToken', authController.verify);

authRouter.post('/login', schemaHandler(authSchema.login, 'body'), authController.login);

authRouter.get(
  '/refresh-token',
  authJwtHandler(config.refreshSecret),
  authRoleHandler('customer'),
  authController.refreshToken
);

authRouter.post('/recover-password', schemaHandler(authSchema.recoverPassword, 'body'), authController.recoverPassword);

authRouter.patch(
  '/change-password/:recoverToken',
  schemaHandler(authSchema.changePassword, 'body'),
  authController.changePassword
);

export default authRouter;
