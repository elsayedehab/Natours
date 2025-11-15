//const { router } = require('../app');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
//const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const express = require('express');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAlltours);

router.route('/tour-stats').get(tourController.getTourstats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/tour-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//Router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAlltours)
  .post(
    authController.protect,
    authController.restrictTo('user', 'lead-guide', 'admin'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );
/*
Router.route('/:tourId/reviews').post(
  authController.protect,
  authController.restrictTo('user'),
  reviewController.createReview,
);
*/
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
