export const errorHandler = (error, req, res, next) => {
  if (error.statusCode) {
    const { statusCode, message } = error;
    res.status(statusCode).json({ message });
  } else {
    const { stack } = error;
    res.status(500).json({ message: stack });
  }
};
