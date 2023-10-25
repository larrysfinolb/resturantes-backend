import statisticService from '../../services/admin/statisticService.js';

const getAll = async (req, res, next) => {
  statisticService
    .getAll()
    .then((data) => {
      res.status(200).json({ message: 'STATISTIC_FOUND', data });
    })
    .catch((error) => {
      next(error);
    });
};

export default {
  getAll,
};
