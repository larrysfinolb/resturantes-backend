import express from 'express';
import authRouter from './authRouter.js';

const adminRouter = express.Router();

adminRouter.use('/auth', authRouter);

export default adminRouter;
