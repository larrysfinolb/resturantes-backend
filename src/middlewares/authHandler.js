import jwt from 'jsonwebtoken';

const authJwtHandler = (secret) => {
  return (req, res, next) => {
    try {
      let { authorization } = req.headers;

      if (!authorization) throw { statusCode: 401, message: 'UNAUTHORIZED' };

      authorization = authorization.replace('Bearer ', '');

      jwt.verify(authorization, secret, (err, decoded) => {
        if (err) throw { statusCode: 498, message: 'INVALID_TOKEN' };

        req.user = decoded;
        next();
      });
    } catch (err) {
      next(err);
    }
  };
};

const authRoleHandler = (role) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== role) throw { statusCode: 403, message: 'FORBIDDEN' };
      next();
    } catch (err) {
      next(err);
    }
  };
};

export { authJwtHandler, authRoleHandler };
