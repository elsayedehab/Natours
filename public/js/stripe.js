import axios from 'axios';
import { showAlert } from './alerts';

/* eslint-disable*/
const stripe = Stripe(
  'pk_test_51SPYoq2Ytt9QKxNMv4JZBuilb1Yvfrhl51R5yyyW0LbWQhpb043uoMMMs0b7vVFQw5A3krwB3suApOyNtf4k0PSS00uEhGjESz',
);

export const bookTour = async (tourId) => {
  try {
    // 1) جلب جلسة الشراء من السيرفر
    const session = await axios.get(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // 2) تحويل المستخدم لصفحة الدفع الخاصة بـ Stripe
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.error(err);
    showAlert('error', err.response?.data?.message || err.message);
  }
};
