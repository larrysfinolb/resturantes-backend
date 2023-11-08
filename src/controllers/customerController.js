import customerService from '../services/customerService.js';

const getAllCustomers = (req, res, next) => {
  customerService
    .getAllCustomers()
    .then((data) => res.status(200).json({ message: 'CUSTOMERS_FOUND', status: data }))
    .catch((err) => next(err));
};

const getOneCustomer = (req, res, next) => {
  const { params } = req;

  customerService
    .getOneCustomer(params)
    .then((data) => res.status(200).json({ message: 'CUSTOMER_FOUND', status: data }))
    .catch((err) => next(err));
};

const updateOneCustomer = (req, res, next) => {
  const { params, body } = req;

  customerService
    .updateOneCustomer(params, body)
    .then((data) => res.status(200).json({ message: 'CUSTOMER_UPDATED', status: data }))
    .catch((err) => next(err));
};

const getAllOrdersByCustomer = (req, res, next) => {
  const { query, params } = req;

  customerService
    .getAllOrdersByCustomer(query, params)
    .then((data) => res.status(200).json({ message: 'ORDERS_FOUND', status: data }))
    .catch((err) => next(err));
};

const getAllPaymentsByCustomer = (req, res, next) => {
  const { query, params } = req;

  customerService
    .getAllPaymentsByCustomer(query, params)
    .then((data) => res.status(200).json({ message: 'PAYMENTS_FOUND', status: data }))
    .catch((err) => next(err));
};

export default { getAllCustomers, getOneCustomer, getAllOrdersByCustomer, getAllPaymentsByCustomer, updateOneCustomer };
