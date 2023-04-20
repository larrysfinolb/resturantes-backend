import express from 'express';
import tableRouter from './tableRouter.js';
import authRouter from './authRouter.js';

const v1Router = express.Router();

v1Router.use('/tables', tableRouter);
v1Router.use('/auth', authRouter);

export default v1Router;
