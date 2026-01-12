# Quick Setup: Email Notifications for New User Accounts

## ✅ What Was Implemented

An automated email notification system that sends welcome emails with login credentials when new user accounts are created in NabdTwin.

## 🚀 Quick Start (3 Minutes)

### Step 1: Configure Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App Passwords**: https://myaccount.google.com/apppasswords
4. Generate a new app password for "Mail"
5. Copy the 16-character password (e.g., `xxxx xxxx xxxx xxxx`)

### Step 2: Update Backend .env File

Open or create: `app/backend/be-nabdtwin-strapi/.env`

Add these lines (replace with your actual values):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_DEFAULT_FROM=your-email@gmail.com
SMTP_DEFAULT_REPLY_TO=support@nabdtwin.com
FRONTEND_URL=http://localhost:5173
```

### Step 3: Restart Backend Server

```bash
cd app/backend/be-nabdtwin-strapi
npm run develop
```

### Step 4: Test It! 🎉

1. Log in as admin in the frontend
2. Go to Accounts page
3. Create a new user
4. Check the new user's email inbox

## 📧 What the User Receives

The new user will receive a professional email with:
- Welcome message
- Their username (email)
- Their password
- A "Login to NabdTwin" button
- Security reminder to change password after first login

## 🔧 Files Modified

1. ✅ `config/plugins.ts` - Email plugin configuration (using sendmail provider)
2. ✅ `src/config/email.ts` - Custom nodemailer email service
3. ✅ `src/extensions/users-permissions/content-types/user/lifecycles.ts` - Auto-email on user creation
4. ✅ `package.json` - Added nodemailer dependency
5. ✅ `.env.example` - Email configuration template

## 📝 Using Other Email Providers

### Outlook/Office 365:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

## ❓ Troubleshooting

**Email not sending?**
- Check backend console logs for error messages
- Verify Gmail App Password (not regular password)
- Ensure 2-Step Verification is enabled
- Check port 587 is not blocked by firewall

**Gmail errors?**
- Must use App Password, NOT regular Gmail password
- 2-Step Verification must be enabled

## 📚 Full Documentation

See `EMAIL_SETUP_GUIDE.md` for comprehensive documentation, including:
- Email template customization
- Advanced configuration
- Security best practices
- Monitoring and logging

## ✨ Features

- ✅ Automatic email on user creation
- ✅ Professional HTML email template
- ✅ Password included in welcome email
- ✅ Security reminders
- ✅ Login button with link
- ✅ Error handling (won't break user creation)
- ✅ Console logging for debugging

---

**Need Help?** Check the console logs or see EMAIL_SETUP_GUIDE.md for detailed troubleshooting.
