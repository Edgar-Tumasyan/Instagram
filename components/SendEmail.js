const sgMail = require('@sendgrid/mail');

const config = require('../config');

sgMail.setApiKey(config.SENDGRID_API_KEY);

const SendEmail = async (receiverEmail, senderEmail, resetURL, subject) => {
    const info = `<p>Please reset password by clicking on the following link:
  <a href="${resetURL}">Reset password</a></p>`;

    const msg = { to: receiverEmail, from: senderEmail, subject, html: `<h4>Hello</h4> ${info}` };

    return await sgMail.send(msg);
};

module.exports = SendEmail;
