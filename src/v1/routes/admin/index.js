import express from 'express';
import authRouter from './authRouter.js';
import statisticRouter from './statisticRouter.js';

const adminRouter = express.Router();

adminRouter.use('/auth', authRouter);
adminRouter.use('/statitics', statisticRouter);

export default adminRouter;
