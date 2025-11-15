const AppError = require('./../utils/AppError');

// Handle duplicate fields in DB (error code 11000)
const HandleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(.*?)\1/)[2]; // ناخد القيمة بدون علامات الاقتباس
  const message = `Duplicate field value: "${value}". Please use another value!`;
  return new AppError(message, 400);
};

const HandleJWTError = () => {
  return new AppError('invalid token. please log in again.', 401);
};
const HandleJWTExpiredError = () => {
  return new AppError('your  token has expired! please log in again', 401);
};

// Handle invalid ObjectId or other cast errors
const HandleCastError = (err) => {
  return new AppError(`Invalid ${err.path}: ${err.value}`, 400);
};

// Handle Mongoose validation errors
const HandleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Send full error in development
const SendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    //render website
    res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: err.message,
    });
  }
};

// Send simplified error in production
const SendErrorPro = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  } else {
    //B) Render website
    if (err.isOperational) {
      return res.status(err.statusCode).render('error', {
        title: 'Something Went Wrong!',
        msg: err.message,
      });
    }
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong!',
      msg: 'Please Try Again Later!',
    });
  }
};

// Main global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    SendErrorDev(err, req, res); // ✅ هنا أضفنا req
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    error.message = err.message;

    if (error.name === 'CastError') error = HandleCastError(error);
    if (error.code === 11000) error = HandleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = HandleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = HandleJWTError();
    if (error.name === 'TokenExpiredError') error = HandleJWTExpiredError();

    SendErrorPro(error, req, res); // ✅ كمان هنا لازم تمرر req
  }
};
