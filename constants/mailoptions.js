
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,
    to: "abdulazizredi1993@gmail.com",
    subject: "Hello from Node.js",
    text: "This is a test email sent from a mailgram.",
  };

  module.exports = mailOptions