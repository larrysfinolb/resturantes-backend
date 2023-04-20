import authService from '../services/authService.js';

const verify = (req, res, next) => {
  authService
    .verify()
    .then(() => {
      res.status(200).json({ message: 'Verified' });
    })
    .catch((err) => {
      next(err);
    });
};

const login = (req, res, next) => {
  const { body } = req;

  authService
    .login(body)
    .then((token) => {
      res.status(200).json({ status: 'OK', data: token });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

const signup = (req, res, next) => {
  const { body } = req;

  authService
    .signup(body)
    .then((createdCustomer) => {
      res.status(201).json({ status: 'Created', data: createdCustomer });
    })
    .catch((err) => {
      next(err);
    });
};

export default { verify, login, signup };
