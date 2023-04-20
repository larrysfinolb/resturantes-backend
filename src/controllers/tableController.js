import tableService from '../services/tableService.js';

const getAllTables = (req, res, next) => {
  tableService
    .getAllTables()
    .then((allTables) => {
      res.status(200).json({ status: 'OK', data: allTables });
    })
    .catch((err) => {
      next(err);
    });
};

const getOneTable = (req, res, next) => {
  const { tableId } = req.params;

  tableService
    .getOneTable({ tableId })
    .then((oneTable) => {
      res.status(200).json({ status: 'OK', data: oneTable });
    })
    .catch((err) => {
      next(err);
    });
};

const createNewTable = (req, res, next) => {
  tableService
    .createNewTable()
    .then((newTable) => {
      res.status(201).json({ status: 'Created', data: newTable });
    })
    .catch((err) => {
      next(err);
    });
};

const updateOneTable = (req, res, next) => {
  const { tableId } = req.params;

  tableService
    .updateOneTable({ tableId })
    .then((updatedTable) => {
      res.status(200).json({ status: 'OK', data: updatedTable });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteOneTable = (req, res, next) => {
  const { tableId } = req.params;

  tableService
    .deleteOneTable({ tableId })
    .then((deletedTable) => {
      res.status(200).json({ status: 'OK', data: deletedTable });
    })
    .catch((err) => {
      next(err);
    });
};

export default { getAllTables, getOneTable, createNewTable, updateOneTable, deleteOneTable };
