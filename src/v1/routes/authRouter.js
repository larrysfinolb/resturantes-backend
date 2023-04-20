import express from 'express';
import authController from '../../controllers/authController.js';
import { authJwtHandler } from '../../middlewares/authHandler.js';
import { config } from '../../config/index.js';

const authRouter = express.Router();

authRouter.get('/verify', authJwtHandler(config.qrSecret), authController.verify);

authRouter.post('/login', authJwtHandler(config.qrSecret), authController.login);

authRouter.post('/signup', authJwtHandler(config.qrSecret), authController.signup);

export default authRouter;
