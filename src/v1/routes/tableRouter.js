import express from 'express';
import tableController from '../../controllers/tableController.js';

const tableRouter = express.Router();

tableRouter.get('/', tableController.getAllTables);

tableRouter.get('/:tableId', tableController.getOneTable);

tableRouter.post('/', tableController.createNewTable);

tableRouter.patch('/:workoutId', tableController.updateOneTable);

tableRouter.delete('/:tableId', tableController.deleteOneTable);

export default tableRouter;
