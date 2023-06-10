import tableService from '../services/tableService.js';

const getAllTables = (req, res, next) => {
  tableService
    .getAllTables()
    .then((data) => {
      res.status(200).json({ message: 'TABLES_FOUND', data });
    })
    .catch((err) => {
      next(err);
    });
};

const getOneTable = (req, res, next) => {
  const { params } = req;

  tableService
    .getOneTable(params)
    .then((data) => {
      res.status(200).json({ message: 'TABLE_FOUND', data });
    })
    .catch((err) => {
      next(err);
    });
};

const createNewTable = (req, res, next) => {
  const { body } = req;

  tableService
    .createNewTable(body)
    .then((data) => {
      res.status(201).json({ message: 'TABLE_CREATED', data });
    })
    .catch((err) => {
      next(err);
    });
};

const updateOneTable = (req, res, next) => {
  const { params } = req;
  const { body } = req;

  tableService
    .updateOneTable(params, body)
    .then((data) => {
      res.status(200).json({ message: 'TABLE_UPDATED', data });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteOneTable = (req, res, next) => {
  const { params } = req;

  tableService
    .deleteOneTable(params)
    .then(() => {
      res.status(200).json({ message: 'TABLE_DELETED', data: null });
    })
    .catch((err) => {
      next(err);
    });
};

export default { getAllTables, getOneTable, createNewTable, updateOneTable, deleteOneTable };
