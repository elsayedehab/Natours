const Tour = require('./../models/tourmodel');
const booking = require('./../models/bookingModel');

const { match } = require('assert');
const { error } = require('console');
const APIFeatures = require('./../utils/APIFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('../utils/AppError');
const factory = require('./handlerFactory.js');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //1) get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  //2) create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment', // ✅ مهم جداً
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} TOUR`,
            description: tour.summary,
            images: [`http://127.0.0.1:3000/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  //3) create session as respose
  res.status(200).json({
    status: 'success',
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour && !user && !price) return next();
  await booking.create({ tour, user, price });

  res.redirect('/');
});

exports.createBooking = factory.createOne(booking);
exports.geteBooking = factory.getOne(booking);
exports.getAllBooking = factory.getAll(booking);
exports.updateBooking = factory.updateOne(booking);
exports.deleteBooking = factory.deleteOne(booking);
