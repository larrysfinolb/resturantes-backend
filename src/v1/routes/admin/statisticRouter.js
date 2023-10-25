import express from 'express';
import statisticController from '../../../controllers/admin/statisticService.js';
import { config } from '../../../config/index.js';
import { authJwtHandler, authRoleHandler } from '../../../middlewares/authHandler.js';

const statisticRouter = express.Router();

statisticRouter.get('/', authJwtHandler(config.accessSecret), authRoleHandler('admin'), statisticController.getAll);

export default statisticRouter;
