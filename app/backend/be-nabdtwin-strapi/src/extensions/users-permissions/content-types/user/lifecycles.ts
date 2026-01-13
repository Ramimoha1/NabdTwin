import { sendEmail } from '../../../../config/email';

export default {
  /**
   * Triggered after a new user is created
   * Only sends email when admin creates a user (confirmed: true)
   */
  async afterCreate(event) {
    const { result, params } = event;
    
    try {
      // Get the password from the params (it's available before hashing during creation)
      const password = params.data.password;
      const userEmail = result.email;
      const username = result.username;
      const isConfirmed = params.data.confirmed;

      // Only send email if:
      // 1. Password is provided (admin created with password)
      // 2. Email exists
      // 3. User is confirmed (indicates admin creation, not self-registration)
      if (!password || !userEmail) {
        console.log('⏭️ Missing password or email, skipping welcome email');
        return;
      }

      if (!isConfirmed) {
        console.log('⏭️ User not confirmed (self-registration), skipping welcome email');
        return;
      }

      console.log(`📧 Sending welcome email to ${userEmail} (admin-created user)`);

      // Send welcome email with credentials
      await sendEmail({
        to: userEmail,
        from: process.env.SMTP_DEFAULT_FROM || 'noreply@nabdtwin.com',
        subject: 'Welcome to NabdTwin - Your Account Details',
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
              .credentials-box {
                background: white;
                border: 2px solid #2563eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
              }
              .credential-item {
                margin: 15px 0;
                padding: 10px;
                background: #f3f4f6;
                border-radius: 4px;
              }
              .label {
                font-weight: bold;
                color: #1e40af;
                display: block;
                margin-bottom: 5px;
              }
              .value {
                font-size: 16px;
                color: #111827;
                word-break: break-all;
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
              .button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Welcome to NabdTwin!</h1>
              <p>Your account has been successfully created</p>
            </div>
            
            <div class="content">
              <p>Hello <strong>${username}</strong>,</p>
              
              <p>Your account for the NabdTwin Organizational Visualization Platform has been created. Below are your login credentials:</p>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #2563eb;">Your Login Credentials</h3>
                
                <div class="credential-item">
                  <span class="label">Username / Email:</span>
                  <span class="value">${userEmail}</span>
                </div>
                
                <div class="credential-item">
                  <span class="label">Password:</span>
                  <span class="value">${password}</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <p style="margin: 10px 0 0 0;">
                  Please change your password after your first login for security purposes. 
                  You can do this by clicking on your profile in the sidebar.
                </p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="button">
                  Login to NabdTwin
                </a>
              </div>
              
              <p style="margin-top: 30px;">
                If you have any questions or need assistance, please contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p>
                This is an automated message from NabdTwin.<br>
                Please do not reply to this email.
              </p>
              <p>
                © ${new Date().getFullYear()} NabdTwin. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
        text: `
Welcome to NabdTwin!

Your account has been successfully created.

Login Credentials:
------------------
Username/Email: ${userEmail}
Password: ${password}

IMPORTANT: Please change your password after your first login for security purposes.

Login URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}

If you have any questions or need assistance, please contact our support team.

--
This is an automated message from NabdTwin.
© ${new Date().getFullYear()} NabdTwin. All rights reserved.
        `,
      });

      console.log(`✅ Welcome email sent successfully to ${userEmail}`);
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      // Don't throw error to avoid breaking user creation
      // Email failure should not prevent account creation
    }
  },
};
