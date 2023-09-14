
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
function sendEmail(chatId,message ,email) {
    const mailOptions = {
      from: process.env.MAIL_FROM_ADDRESS,
      to: email,
      subject: message,
      text: "This is a test email sent from a mailgram.",
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        
        console.error("Error sending email:", error);
        bot.sendMessage(chatId, "An error occurred while sending the email.");
      } else {
        // Email sent successfully
        console.log("Email sent:", info.response);
        bot.sendMessage(
          chatId,
          "The file has been sent to your registered email address."
        );
      }
    }); 
  }
  // Function to send a file to the registered email without saving it locally
function sendFileToEmail(chatId, email, fileBuffer , file_name) {
 
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,   // Sender's email address
    to: email, // Recipient's email address (registered user's email)
    subject: 'File from Telegram Bot', // Email subject
    text: 'Here is the file you requested:', // Plain text body
    attachments: [
      {
        filename: file_name, // Name of the attachment
        content: fileBuffer, // Buffer containing the file content
      },
    ],
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      // Handle the error (e.g., log it)
      console.error('Error sending email:', error);
      bot.sendMessage(chatId, 'An error occurred while sending the email.');
    } else {
      // Email sent successfully
      console.log('Email sent:', info.response);
      bot.sendMessage(chatId, 'The file has been sent to laziz email address.');
    }
  });
}
module.exports = {sendEmail , sendFileToEmail}  