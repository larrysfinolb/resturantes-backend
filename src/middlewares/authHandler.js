import jwt from 'jsonwebtoken';

const authJwtHandler = (secret) => {
  return (req, res, next) => {
    try {
      let { authorization } = req.headers;

      if (!authorization) throw { statusCode: 401, statusMessage: 'Unauthorized' };

      authorization = authorization.replace('Bearer ', '');

      jwt.verify(authorization, secret, (err, decoded) => {
        if (err) {
          throw { statusCode: 401, statusMessage: 'Unauthorized' };
        }
        next();
      });
    } catch (err) {
      next(err);
    }
  };
};

export { authJwtHandler };
