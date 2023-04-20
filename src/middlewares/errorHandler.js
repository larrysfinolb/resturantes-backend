const errorHandler = (error, req, res, next) => {
  if (error.statusCode && error.statusMessage) {
    const { statusCode, statusMessage } = error;
    res.status(statusCode).json({ status: statusMessage, message: error?.message });
  } else {
    res.status(500).json({ status: 'Internal Server Error', message: error?.message });
  }
};

export { errorHandler };
