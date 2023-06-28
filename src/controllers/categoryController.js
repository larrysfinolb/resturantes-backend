import categoryService from '../services/categoryService.js';

const getAllCategories = (_req, res, next) => {
  categoryService
    .getAllCategories()
    .then((data) => {
      res.status(200).json({ message: 'CATEGORIES_FOUND', data });
    })
    .catch((err) => next(err));
};

const getOneCategory = (req, res, next) => {
  const { params } = req;

  categoryService
    .getOneCategory(params)
    .then((data) => {
      res.status(200).json({ message: 'CATEGORY_FOUND', data });
    })
    .catch((err) => next(err));
};

const createNewCategory = (req, res, next) => {
  const { body } = req;

  categoryService
    .createNewCategory(body)
    .then((data) => {
      res.status(201).json({ message: 'CATEGORY_CREATED', data });
    })
    .catch((err) => next(err));
};

const updateOneCategory = (req, res, next) => {
  const { params } = req;
  const { body } = req;

  categoryService
    .updateOneCategory(params, body)
    .then((data) => {
      res.status(200).json({ message: 'CATEGORY_UPDATED', data });
    })
    .catch((err) => next(err));
};

const deleteOneCategory = (req, res, next) => {
  const { params } = req;

  categoryService
    .deleteOneCategory(params)
    .then(() => {
      res.status(200).json({ message: 'CATEGORY_DELETED', data: null });
    })
    .catch((err) => next(err));
};

const getAllDishesByCategory = (req, res, next) => {
  const { params } = req;

  categoryService
    .getAllDishesByCategory(params)
    .then((data) => {
      res.status(200).json({ message: 'DISHES_FOUND', data });
    })
    .catch((err) => next(err));
};

export default {
  getAllCategories,
  getOneCategory,
  createNewCategory,
  updateOneCategory,
  deleteOneCategory,
  getAllDishesByCategory,
};
