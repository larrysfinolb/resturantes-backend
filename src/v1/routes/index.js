import express from 'express';
import adminRouter from './admin/index.js';
import tableRouter from './tableRouter.js';
import authRouter from './authRouter.js';
import dishRouter from './dishRouter.js';

const v1Router = express.Router();

v1Router.use('/admin', adminRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/tables', tableRouter);
v1Router.use('/dishes', dishRouter);

export default v1Router;
