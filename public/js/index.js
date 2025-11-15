/* eslint-disable */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
//import { bookTour } from './stripe';
import { showAlert } from './alerts';
import { bookTour } from './stripe';

// DOM ELEMENTS
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// DELEGATION

// LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

// LOGOUT
if (logOutBtn) {
  logOutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}

// UPDATE USER DATA (NAME, EMAIL, PHOTO)
if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);

    const photoInput = document.getElementById('photo');
    if (photoInput.files[0]) form.append('photo', photoInput.files[0]);

    try {
      const res = await updateSettings(form, 'data');

      // فوراً تحديث صورة المستخدم في الصفحة
      if (res?.data?.user?.photo) {
        const userPhoto = document.getElementById('user-photo');
        if (userPhoto) {
          userPhoto.src = `/img/users/${res.data.user.photo}?t=${Date.now()}`;
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
}

// UPDATE PASSWORD
if (userPasswordForm) {
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('.btn--save-password');
    btn.textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    btn.textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

// BOOK TOUR
if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });
}

// ALERT
const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
