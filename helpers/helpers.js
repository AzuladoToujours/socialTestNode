const nodeMailer = require('nodemailer');

const defaultEmailData = {from: 'noreply@testing.com'};

exports.sendEmail = emailData => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: 'violet.miller0@ethereal.email',
            pass: '258UZRD762kcEq7uva'
        }
      });
      return transporter
    .sendMail(emailData)
    .then(info => console.log(`Message sent: ${info.response}`))
    .catch(err => console.log(`Problem sending email: ${err}`));
}