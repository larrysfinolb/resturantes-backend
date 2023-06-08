import express from 'express';
import authController from '../../../controllers/admin/authController.js';
import { schemaHandler } from '../../../middlewares/schemaHandler.js';
import authSchema from '../../../schemas/admin/authSchema.js';
import { authJwtHandler, authRoleHandler } from '../../../middlewares/authHandler.js';
import { config } from '../../../config/index.js';

const authRouter = express.Router();

authRouter.post('/login', schemaHandler(authSchema.login, 'body'), authController.login);

authRouter.get('/refresh-token', authJwtHandler(config.refreshSecret), authController.refreshToken);

authRouter.patch(
  '/change-username-password',
  authJwtHandler(config.accessSecret),
  authRoleHandler('admin'),
  schemaHandler(authSchema.changeUsernamePassword, 'body'),
  authController.changeUsernamePassword
);

export default authRouter;
