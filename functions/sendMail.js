
require("dotenv").config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });
  function sendMessage(ctx, text) {
    ctx.reply(text);
  }
 function sendEmail(ctx, message ,email) {
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: email,
    subject: 'Mailgram',
    text: message,
  };
   transporter.sendMail (mailOptions, (error, info) => {
    if (error) {
      
      console.error("Error sending email:", error);
      sendMessage(ctx , "An error occurred while sending the email.");
    } else {
      console.log("Email sent:", info.response);
      sendMessage(ctx , "your email has been sent successfully")

    }
  }); 
}
  function sendFileToEmail(ctx,  email, fileBuffer , file_name) {
 
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: email, 
      subject: 'File from Mailgram bot',
      text: 'Here is the file you requested:',
      attachments: [
        {
          filename: file_name,
          content: fileBuffer,
        },
      ],
    };
  
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        
        console.error('Error sending email:', error);
        sendMessage(ctx , 'An error occurred while sending the email.');
      } else {
        console.log('Email sent:', info.response);
        sendMessage(ctx , 'The file has been sent to your email address.');
      }
    });
  }
module.exports = {sendEmail , sendFileToEmail}  