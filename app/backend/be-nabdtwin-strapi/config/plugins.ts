export default ({ env }) => ({
  email: {
    config: {
      provider: 'sendmail',
      providerOptions: {
        dkim: {
          privateKey: '',
          keySelector: '',
        },
      },
      settings: {
        defaultFrom: env('SMTP_DEFAULT_FROM', 'noreply@nabdtwin.com'),
        defaultReplyTo: env('SMTP_DEFAULT_REPLY_TO', 'support@nabdtwin.com'),
      },
    },
  },
});
