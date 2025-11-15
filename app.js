const express = require('express');
const { json } = require('stream/consumers');
const app = express();
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const GlobalEroorHandler = require('./controllers/errorController');
const TourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const viewRouter = require('./Routes/viewRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');

const { error } = require('console');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const Tour = require('./models/tourmodel');
const cookieparser = require('cookie-parser');

app.set('view engine', 'pug');

//tells express that all templates exsits in views folder
app.set('views', path.join(__dirname, 'views'));

//Global MIDDLEWARES
//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security http headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:'], // خلي data و blob عشان الصور والخرائط
        scriptSrc: [
          "'self'",
          'https://cdn.jsdelivr.net',
          'https://js.stripe.com', // ✅ Stripe
          'https://api.mapbox.com', // ✅ Mapbox JS
          'https://cdnjs.cloudflare.com', // (اختياري) لو استخدمت مكتبات إضافية
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // ✅ ضروري لأن Mapbox و Tailwind تستخدم inline CSS
          'https://fonts.googleapis.com',
          'https://api.mapbox.com',
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://api.mapbox.com', // ✅ لخريطة Mapbox
        ],
        connectSrc: [
          "'self'",
          'ws://127.0.0.1:*', // ✅ Parcel/Webpack HMR WebSocket
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://js.stripe.com',
        ],
        frameSrc: [
          "'self'",
          'https://js.stripe.com', // ✅ Stripe يفتح نافذة الدفع داخل iframe
        ],
      },
    },
  }),
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//limit reqs from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, pease try again in an hour!',
});
app.use('/api', limiter);

//body parser,readind data from body into req body
app.use(express.json({ limit: '10kb' }));

app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieparser());

//data sanitization against nosql query injection
app.use(mongoSanitize());

//data sanitization against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//tset middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

/*
app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello from the server', app: 'natours' });
});

app.post('/', (req, res) => {
  res.send('yuo can post to this endpoint...');
});
*/

//ROUTE HANDELLS
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', TourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  /*
  const err = new error(`cant get ${req.originalUrl} on this server`);
  err.status = 'fail';
  err.statusCode = 404;
  next(err);
  */
  next(new AppError(`cant get ${req.originalUrl} on this server`, 404));
});

app.use(GlobalEroorHandler);

//START SERVER

module.exports = app;
