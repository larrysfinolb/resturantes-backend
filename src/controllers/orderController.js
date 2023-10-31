import orderService from '../services/orderService.js';

const getAllOrders = (req, res, next) => {
  const { query } = req;

  orderService
    .getAllOrders(query)
    .then((data) => res.status(200).json({ message: 'ORDERS_FOUND', data }))
    .catch((err) => next(err));
};

const getOneOrder = (req, res, next) => {
  const { params } = req;

  orderService
    .getOneOrder(params)
    .then((data) => res.status(200).json({ message: 'ORDER_FOUND', data }))
    .catch((err) => next(err));
};

const createNewOrder = (req, res, next) => {
  const { body, user } = req;

  orderService
    .createNewOrder({ customerId: user.sub }, body)
    .then((data) => res.status(201).json({ message: 'ORDER_CREATED', data }))
    .catch((err) => next(err));
};

const updateStatusOrder = (req, res, next) => {
  const { body, params } = req;

  orderService
    .updateStatusOrder(params, body)
    .then((data) => res.status(200).json({ message: 'ORDER_UPDATED', data }))
    .catch((err) => next(err));
};

export default { getAllOrders, getOneOrder, createNewOrder, updateStatusOrder };
