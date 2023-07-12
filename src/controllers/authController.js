import authService from '../services/authService.js';

const signup = (req, res, next) => {
  const { body } = req;

  authService
    .signup(body)
    .then((data) => {
      res.status(201).json({ message: 'SIGNED_UP', data });
    })
    .catch((err) => {
      next(err);
    });
};

const verify = (req, res, next) => {
  const { verifyToken } = req.params;

  authService
    .verify({ verifyToken })
    .then(() => {
      res.status(200).json({ message: 'VERIFIED', data: null });
    })
    .catch((err) => {
      next(err);
    });
};

const login = (req, res, next) => {
  const { body } = req;

  authService
    .login(body)
    .then((data) => {
      res.status(200).json({ message: 'LOGGED_IN', data });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

const refreshToken = (req, res, next) => {
  const { user } = req;
  console.log(user);
  authService
    .refreshToken(user)
    .then((data) => {
      res.status(200).json({ message: 'REFRESH_TOKEN', data });
    })
    .catch((err) => {
      next(err);
    });
};

const recoverPassword = (req, res, next) => {
  const { body } = req;

  authService
    .recoverPassword(body)
    .then(() => {
      res.status(200).json({ message: 'RECOVER_PASSWORD', data: null });
    })
    .catch((err) => {
      next(err);
    });
};

const changePassword = (req, res, next) => {
  const { body } = req;
  const { recoverToken } = req.params;

  authService
    .changePassword({ ...body, recoverToken })
    .then(() => {
      res.status(200).json({ message: 'CHANGE_PASSWORD', data: null });
    })
    .catch((err) => {
      next(err);
    });
};

export default {
  signup,
  verify,
  login,
  refreshToken,
  recoverPassword,
  changePassword,
};
