import paymentService from '../services/paymentService.js';

const getAllPayments = (req, res, next) => {
  paymentService
    .getAllPayments()
    .then((data) => res.status(200).json({ message: 'PAYMENTS_FOUND', data }))
    .catch((err) => next(err));
};

const getOnePayment = (req, res, next) => {
  const { params } = req;

  paymentService
    .getOnePayment(params)
    .then((data) => res.status(200).json({ message: 'PAYMENT_FOUND', data }))
    .catch((err) => next(err));
};

const createNewPayment = (req, res, next) => {
  const { body, file } = req;

  paymentService
    .createNewPayment(body, file)
    .then((data) => res.status(201).json({ message: 'PAYMENT_CREATED', data }))
    .catch((err) => next(err));
};

const updateOnePayment = (req, res, next) => {
  const { params, body } = req;

  paymentService
    .updateOnePayment(params, body)
    .then((data) => res.status(200).json({ message: 'PAYMENT_UPDATED', data }))
    .catch((err) => next(err));
};

export default { getAllPayments, getOnePayment, createNewPayment, updateOnePayment };
