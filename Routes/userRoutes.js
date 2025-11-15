const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const Router = express.Router();
const multer = require('multer');
// ✅ Auth routes (لازم تكون فوق)
Router.post('/signUp', authController.signUp);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);

// ✅ Password reset routes
Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

// ✅ Protect all routes after this middleware
Router.use(authController.protect);

Router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);
Router.get('/me', userController.getMe, userController.getUser);
Router.patch(
  '/updateMe',
  authController.protect,
  userController.uploadUserPhotos,
  userController.resizeUserPhoto,
  userController.updateMe,
);
Router.delete('/deleteMe', userController.deleteMe);

// ✅ Restrict to admin routes
Router.use(authController.restrictTo('admin'));

// ⚠️ لازم يكون آخر شيء
Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.CreateUser);

Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.UpdateUser)
  .delete(userController.deleteUser);

module.exports = Router;
