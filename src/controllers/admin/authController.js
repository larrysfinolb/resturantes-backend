import authService from '../../services/admin/authService.js';

const login = async (req, res, next) => {
  const { body } = req;

  authService
    .login(body)
    .then((data) => {
      res.status(200).json({ message: 'LOGGED_IN', data });
    })
    .catch((err) => next(err));
};

const refreshToken = async (req, res, next) => {
  const { user } = req;

  authService
    .refreshToken(user)
    .then((data) => {
      res.status(200).json({ message: 'REFRESH_TOKEN', data });
    })
    .catch((err) => next(err));
};

const changeUsernamePassword = async (req, res, next) => {
  const { user, body } = req;

  authService
    .changeUsernamePassword(user, body)
    .then(() => {
      res.status(200).json({ message: 'CHANGE_USERNAME_PASSWORD', data: null });
    })
    .catch((err) => next(err));
};

export default {
  login,
  refreshToken,
  changeUsernamePassword,
};
