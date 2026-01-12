# Email Configuration for NabdTwin - User Account Creation Notifications

This guide explains how to configure and use the email notification feature that automatically sends welcome emails with login credentials when new user accounts are created.

## 📧 Features

- ✅ Automatic email sending when a user account is created
- ✅ Professional HTML email template with credentials
- ✅ Secure password handling
- ✅ Support for multiple email providers (Gmail, Outlook, etc.)
- ✅ Customizable email templates
- ✅ Error handling (email failures won't break user creation)

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Navigate to the backend directory and install the required packages:

```bash
cd app/backend/be-nabdtwin-strapi
npm install
```

This will install:
- `@strapi/plugin-email` - Strapi's email plugin
- `@strapi/provider-email-nodemailer` - Nodemailer provider for email sending
- `nodemailer` - Email sending library

### Step 2: Configure Email Provider

#### Option A: Using Gmail (Recommended for Development)

1. **Enable 2-Step Verification** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled

2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password generated

3. **Update .env file** in `app/backend/be-nabdtwin-strapi/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   SMTP_DEFAULT_FROM=your-email@gmail.com
   SMTP_DEFAULT_REPLY_TO=support@nabdtwin.com
   FRONTEND_URL=http://localhost:5173
   ```

#### Option B: Using Outlook/Office 365

Update your `.env` file:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_DEFAULT_FROM=your-email@outlook.com
SMTP_DEFAULT_REPLY_TO=support@nabdtwin.com
FRONTEND_URL=http://localhost:5173
```

#### Option C: Using Other Email Providers

For other providers, check their SMTP settings and update accordingly:
- **AWS SES**: smtp.email.us-east-1.amazonaws.com (Port 587)
- **SendGrid**: smtp.sendgrid.net (Port 587)
- **Mailgun**: smtp.mailgun.org (Port 587)

### Step 3: Start the Backend

```bash
npm run develop
```

The server will start with the email plugin configured.

## 🧪 Testing the Email Feature

### Method 1: Through the Admin UI

1. Log in to your admin account
2. Navigate to the "Accounts" page
3. Click "Create New User"
4. Fill in the user details
5. Click "Create User"
6. Check the email inbox of the new user

### Method 2: Through the Frontend

1. Log in as an admin user
2. Go to the Accounts management page
3. Create a new user
4. The new user will receive an email with their credentials

## 📄 Email Template

The welcome email includes:
- **Subject**: "Welcome to NabdTwin - Your Account Details"
- **Content**:
  - Welcome message
  - Username/Email
  - Password
  - Security warning to change password after first login
  - Login button/link
  - Support contact information

### Sample Email Preview

```
Welcome to NabdTwin!
Your account has been successfully created

Your Login Credentials
----------------------
Username/Email: user@example.com
Password: TempPassword123

⚠️ Important Security Notice:
Please change your password after your first login for security purposes.

[Login to NabdTwin Button]
```

## 🔧 Customization

### Customize Email Template

Edit the file: `app/backend/be-nabdtwin-strapi/src/extensions/users-permissions/content-types/user/lifecycles.ts`

You can modify:
- Email subject
- HTML/Text content
- Styling
- Logo/branding
- Footer information

### Customize Sender Information

Update your `.env` file:
```env
SMTP_DEFAULT_FROM=custom-sender@nabdtwin.com
SMTP_DEFAULT_REPLY_TO=custom-support@nabdtwin.com
```

## 🐛 Troubleshooting

### Email Not Sending

1. **Check Console Logs**: Look for error messages in the Strapi console
2. **Verify Credentials**: Ensure SMTP credentials are correct
3. **Check Firewall**: Ensure port 587 is not blocked
4. **Test Connection**: Try sending a test email manually

### Gmail Specific Issues

- **"Less secure app access"**: Use App Passwords instead
- **"Authentication failed"**: Verify 2-Step Verification is enabled
- **Rate limiting**: Gmail has sending limits for free accounts

### Common Errors

**Error**: `Invalid login: 535-5.7.8 Username and Password not accepted`
- **Solution**: Use App Password for Gmail, not your regular password

**Error**: `Connection timeout`
- **Solution**: Check firewall settings or try a different port

**Error**: `self signed certificate`
- **Solution**: Set `secure: false` in plugins.ts for development

## 📝 Files Modified/Created

1. **`config/plugins.ts`** - Email plugin configuration
2. **`src/extensions/users-permissions/content-types/user/lifecycles.ts`** - User creation lifecycle hook
3. **`.env.email.example`** - Environment variables template
4. **`package.json`** - Added email dependencies

## 🔐 Security Best Practices

1. ✅ **Use App Passwords**: Never use your main email password
2. ✅ **Environment Variables**: Store credentials in `.env`, not in code
3. ✅ **SSL/TLS**: Use secure connections (port 587 with TLS)
4. ✅ **Rate Limiting**: Be aware of provider sending limits
5. ✅ **Error Handling**: Email failures won't break user creation

## 📊 Monitoring

Check Strapi logs for email status:
- ✅ Success: `✅ Welcome email sent successfully to user@example.com`
- ❌ Failure: `❌ Failed to send welcome email: [error details]`

## 🔄 Disabling Email Notifications

To temporarily disable email notifications, comment out the lifecycle hook in:
`src/extensions/users-permissions/content-types/user/lifecycles.ts`

## 📞 Support

For issues or questions:
- Check Strapi documentation: https://docs.strapi.io/dev-docs/plugins/email
- Review nodemailer docs: https://nodemailer.com/
- Contact system administrator

---

**Last Updated**: January 6, 2026
**Version**: 1.0.0
