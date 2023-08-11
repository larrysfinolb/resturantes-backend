import bankService from '../services/bankService.js';

const getAllBanks = (_req, res, next) => {
  bankService
    .getAllBanks()
    .then((data) => {
      res.status(200).json({ message: 'BANKS_FOUND', data });
    })
    .catch((err) => next(err));
};

const getOneBank = (req, res, next) => {
  const { params } = req;

  bankService
    .getOneBank(params)
    .then((data) => {
      res.status(200).json({ message: 'BANK_FOUND', data });
    })
    .catch((err) => next(err));
};

const createNewBank = (req, res, next) => {
  const { body } = req;

  bankService
    .createNewBank(body)
    .then((data) => {
      res.status(201).json({ message: 'BANK_CREATED', data });
    })
    .catch((err) => next(err));
};

const updateOneBank = (req, res, next) => {
  const { params, body } = req;

  bankService
    .updateOneBank(params, body)
    .then((data) => {
      res.status(200).json({ message: 'BANK_UPDATED', data });
    })
    .catch((err) => next(err));
};

const deleteOneBank = (req, res, next) => {
  const { params } = req;

  bankService
    .deleteOneBank(params)
    .then(() => {
      res.status(200).json({ message: 'BANK_DELETED', data: null });
    })
    .catch((err) => next(err));
};

export default { getAllBanks, getOneBank, createNewBank, updateOneBank, deleteOneBank };
