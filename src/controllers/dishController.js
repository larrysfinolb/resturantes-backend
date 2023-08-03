import dishService from '../services/dishService.js';

const getAllDishes = (req, res, next) => {
  dishService
    .getAllDishes()
    .then((data) => {
      res.status(200).json({ message: 'DISHES_FOUND', data });
    })
    .catch((err) => next(err));
};

const getOneDish = (req, res, next) => {
  const { params } = req;

  dishService
    .getOneDish(params)
    .then((data) => {
      res.status(200).json({ message: 'DISH_FOUND', data });
    })
    .catch((err) => next(err));
};

const createNewDish = (req, res, next) => {
  const { body, file } = req;

  dishService
    .createNewDish(body, file)
    .then((data) => {
      res.status(201).json({ message: 'DISH_CREATED', data });
    })
    .catch((err) => next(err));
};

const updateOneDish = (req, res, next) => {
  const { params, body, file } = req;

  dishService
    .updateOneDish(params, body, file)
    .then((data) => {
      res.status(200).json({ message: 'DISH_UPDATED', data });
    })
    .catch((err) => next(err));
};

const deleteOneDish = (req, res, next) => {
  const { params } = req;

  dishService
    .deleteOneDish(params)
    .then(() => {
      res.status(200).json({ message: 'DISH_DELETED', data: null });
    })
    .catch((err) => next(err));
};

export default { getAllDishes, getOneDish, createNewDish, updateOneDish, deleteOneDish };
