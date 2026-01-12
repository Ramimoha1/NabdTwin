import { sendEmail } from '../../../config/email';
import crypto from 'crypto';

export default {
  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;

    if (!email) {
      return ctx.badRequest('email is required');
    }

    console.log(`[FORGOT PASSWORD] Request for email: ${email}`);

    try {
      // Find user by email using query builder
      const users = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email: email } });

      if (!users) {
        // Don't reveal if email exists or not (security)
        console.log(`[FORGOT PASSWORD] User not found for email: ${email}`);
        return ctx.send({
          ok: true,
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Hash the token for storage
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Update user with reset token and expiry
      await strapi.query('plugin::users-permissions.user').update({
        where: { id: users.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        },
      });

      console.log(`[FORGOT PASSWORD] Reset token generated for user: ${users.email}`);

      // Build reset link
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/forgot-password?token=${resetToken}`;

      // Send email
      await sendEmail({
        to: users.email,
        subject: 'NabdTwin - Password Reset Request',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .reset-button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .warning {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
                border-top: 1px solid #e5e7eb;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello ${users.username || users.email},</p>
              
              <p>We received a request to reset your NabdTwin account password.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Reset Password</a>
              </div>
              
              <p>Or copy this link in your browser:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0;">
                  <li>This link will expire in 30 minutes</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>Never share this link with anyone</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} NabdTwin. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
        text: `
Hello ${users.username || users.email},

We received a request to reset your NabdTwin account password.

Reset your password by visiting this link:
${resetLink}

This link will expire in 30 minutes.

If you didn't request this, please ignore this email.

--
© ${new Date().getFullYear()} NabdTwin. All rights reserved.
        `,
      });

      console.log(`[FORGOT PASSWORD] Reset email sent to: ${users.email}`);

      return ctx.send({
        ok: true,
      });
    } catch (error) {
      console.error('[FORGOT PASSWORD] Error:', error);
      console.error('[FORGOT PASSWORD] Error Stack:', error.stack);
      return ctx.internalServerError('Failed to process password reset request');
    }
  },

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPassword(ctx) {
    const { code, password, passwordConfirmation } = ctx.request.body;

    if (!code || !password || !passwordConfirmation) {
      return ctx.badRequest('code, password, and passwordConfirmation are required');
    }

    if (password !== passwordConfirmation) {
      return ctx.badRequest('Passwords do not match');
    }

    console.log('[RESET PASSWORD] Attempting to reset password with token');

    try {
      // Hash the provided token
      const hashedToken = crypto.createHash('sha256').update(code).digest('hex');

      console.log('[RESET PASSWORD] Looking for user with token:', hashedToken.substring(0, 10) + '...');
      console.log('[RESET PASSWORD] Current time:', new Date());

      // Find all users with the reset token first
      const allUsers = await strapi.query('plugin::users-permissions.user').findMany({
        where: {
          resetPasswordToken: { $eq: hashedToken },
        },
      });

      console.log('[RESET PASSWORD] Found users with token:', allUsers.length);

      if (allUsers.length === 0) {
        console.log('[RESET PASSWORD] No user found with this token');
        return ctx.badRequest('Invalid or expired reset token');
      }

      // Check if any of them have valid expiry
      const users = allUsers.find(u => {
        const expiryTime = new Date(u.resetPasswordExpires).getTime();
        const currentTime = new Date().getTime();
        console.log('[RESET PASSWORD] User:', u.email, 'Expiry:', u.resetPasswordExpires, 'Valid:', expiryTime > currentTime);
        return expiryTime > currentTime;
      });

      if (!users) {
        console.log('[RESET PASSWORD] Token expired for all matching users');
        return ctx.badRequest('Invalid or expired reset token');
      }

      console.log('[RESET PASSWORD] Found user:', users.email);

      // Update password using entity service (automatically hashes password)
      const updatedUser = await strapi.entityService.update(
        'plugin::users-permissions.user',
        users.id,
        {
          data: {
            password: password,
            resetPasswordToken: null,
            resetPasswordExpires: null,
          },
        }
      );

      console.log(`[RESET PASSWORD] Password reset successful for user: ${users.email}`);

      return ctx.send({
        ok: true,
        message: 'Password reset successful',
      });
    } catch (error) {
      console.error('[RESET PASSWORD] Error:', error);
      console.error('[RESET PASSWORD] Error Stack:', error.stack);
      console.error('[RESET PASSWORD] Error Message:', error.message);
      return ctx.internalServerError('Failed to reset password');
    }
  },
};
