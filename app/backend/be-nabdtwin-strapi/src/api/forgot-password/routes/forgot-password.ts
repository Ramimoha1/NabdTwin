import crypto from 'crypto';
import { sendEmail } from '../../../config/email';

export default {
  routes: [
    {
      method: 'POST',
      path: '/auth/forgot-password',
      handler: 'forgot-password.forgotPassword',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/reset-password',
      handler: 'forgot-password.resetPassword',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
