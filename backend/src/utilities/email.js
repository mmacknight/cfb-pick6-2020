const nodemailer = require('nodemailer');

let transporter
if (process.env.SEND_EMAIL) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

function sendInvite(league_name, league_admin, league_id, message, email) {
  if (process.env.SEND_EMAIL) {
    const mailOptions = {
      from: `CFB PICK6 Invite <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: `${league_admin} has invited you to join ${league_name}`,
      html: `
      <h1>Welcome</h1>
      <p>${message}</p>
      <p>Got to your profile page to accept your league invitation:</p>
      <a href="https://www.cfbpick6.com/profile?emailLink=${email}">View My Profile</a>
      `
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
  }
}

module.exports = {
  sendInvite: sendInvite
}
