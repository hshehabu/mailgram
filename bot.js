// require("dotenv").config();
// const TelegramBot = require("node-telegram-bot-api");
// const token = process.env.TELEGRAM_BOT_TOKEN;
// const bot = new TelegramBot(token, { polling: true });
// module.exports = bot;
// const commands = require("./commands");
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// let attempts = 5;
// var registeredEmail = [];

// const handleHelp = require("./commands/help");
// const handleSend = require("./commands/send");



// bot.onText(/\/start/, handleStart);

// function handleInfo(msg) {
//   const chatId = msg.chat.id;
//   let response;
//   if (registeredEmail.length == 0) {
//     response = "you haven't registered yet";
//   } else {
//     console.log(registeredEmail);
//     response = registeredEmail[chatId];
//   }
//   bot.sendMessage(chatId, response);
// }

// function handleUpdate(msg) {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, "the new email please : ").then(bot.on('message', (msg) => {
//       const chatId = msg.chat.id;
//       console.log(registeredEmail[chatId]);
   
//       if (msg.text && !msg.text.startsWith('/')) {
//         const userResponse = msg.text;
//         if (emailRegex.test(userResponse)) {
//           registeredEmail[chatId] = userResponse;
//           bot.sendMessage(chatId , `updated as ${userResponse}`);
//           return;
//         } else {
//           attempts--;
//           bot.sendMessage(chatId, `invalid email ${attempts} attempts left`);
//         }
//       }
//     }));
  
//   }
//   function handleStart(msg) {
//     const chatId = msg.chat.id;
//     const welcomeMessage = "Welcome to Mailgram bot!\nSend us your email:";
//     bot.sendMessage(chatId, welcomeMessage).then(bot.on('message', (msg) => {
//       const chatId = msg.chat.id;
//       console.log(registeredEmail[chatId]);
   
//       if (msg.text && !msg.text.startsWith('/')) {
//         const userResponse = msg.text;
//         if (emailRegex.test(userResponse)) {
//           registeredEmail[chatId] = userResponse;
//           bot.sendMessage(chatId , `registered as ${userResponse}`);
//           return;
//         } else {
//           attempts--;
//           bot.sendMessage(chatId, `invalid email ${attempts} attempts left`);
//         }
//       }
//     }));
//   }

//   bot.onText(/\/help/, handleHelp);
//   bot.onText(/\/send/, handleSend);
//   bot.onText(/\/update/, handleUpdate);
//   bot.onText(/\/info/, handleInfo);

require("dotenv").config();

const { Telegraf, Markup, Scenes, session } = require('telegraf');
const axios = require('axios')
const nodemailer = require('nodemailer');
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let attempts = 5;
var registeredEmail = [];
// Create a simple state object to store user data
const state = {};
// Middleware to start and end conversations
bot.use(session());
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
      // Email sent successfully
      console.log("Email sent:", info.response);
      sendMessage(ctx , "your email has been sent successfully")
      // sendMessage("Email sent successfully.");
    }
  }); 
}

function sendFileToEmail(ctx,  email, fileBuffer , file_name) {
 
  const mailOptions = {
    from: process.env.MAIL_FROM_ADDRESS,   // Sender's email address
    to: email, // Recipient's email address (registered user's email)
    subject: 'File from Mailgram bot', // Email subject
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
      sendMessage(ctx , 'An error occurred while sending the email.');
    } else {
      // Email sent successfully
      console.log('Email sent:', info.response);
      sendMessage(ctx , 'The file has been sent to your email address.');
    }
  });
}
// Create a wizard scene for the /start command
const startWizard = new Scenes.WizardScene(
  'start_wizard',
  (ctx) => {
    ctx.reply(`Hi ${ctx.chat.first_name} Please enter your email address:`);
    return ctx.wizard.next();
  },
  (ctx) => {
    const userResponse = ctx.message.text;
    if (emailRegex.test(userResponse)) {
      const chatId = ctx.chat.id;
      registeredEmail[chatId] = userResponse;
      ctx.reply(`Registered as ${userResponse}`);
      return ctx.scene.leave();
    } else {
      attempts--;
      ctx.reply(`Invalid email. ${attempts} attempts left. Do you want to try again?`, Markup.inlineKeyboard([
        Markup.button.callback('Yes', 'try_again'),
        Markup.button.callback('No', 'cancel_registration'),
      ]));
      return ctx.wizard.next();
    }
  },
  (ctx) => {
    const userResponse = ctx.update.callback_query.data;
    if (userResponse === 'try_again') {
      ctx.reply('Please enter your new email address:');
      return ctx.wizard.back();
    } else if (userResponse === 'cancel_registration') {
      ctx.reply('Cancelled registration.');
      return ctx.scene.leave();
    }
  }
);

// Create a wizard scene for the /update command
const updateWizard = new Scenes.WizardScene(
  'update_wizard',
  (ctx) => {
    ctx.reply('Please enter the new email address:');
    return ctx.wizard.next();
  },
  (ctx) => {
    const userResponse = ctx.message.text;
    if (emailRegex.test(userResponse)) {
      const chatId = ctx.chat.id;
      registeredEmail[chatId] = userResponse;
      ctx.reply(`Updated as ${userResponse}`);
      return ctx.scene.leave();
    } else {
      attempts--;
      ctx.reply(`Invalid email. ${attempts} attempts left. Do you want to try again?`, Markup.inlineKeyboard([
        Markup.button.callback('Yes', 'try_again'),
        Markup.button.callback('No', 'cancel_update'),
      ]));
      return ctx.wizard.next();
    }
  },
  (ctx) => {
    const userResponse = ctx.update.callback_query.data;
    if (userResponse === 'try_again') {
      ctx.reply('Please enter the new email address:');
      return ctx.wizard.back();
    } else if (userResponse === 'cancel_update') {
      ctx.reply('Cancelled email update.');
      return ctx.scene.leave();
    }
  }
);

const sendWizard = new Scenes.WizardScene('send_wizard' ,
  (ctx)=>{
      ctx.reply('send a file or a text!')
      return ctx.wizard.next();
  },
 async (ctx)=>{
    if(ctx.message.document){
    
    const fileId = ctx.message.document.file_id;
      const fileName = ctx.message.document.file_name;

      try {
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink, { responseType: 'arraybuffer' });

        const fileBuffer = Buffer.from(response.data);

        sendFileToEmail(ctx, registeredEmail[ctx.chat.id], fileBuffer, fileName);
      } catch (error) {
        sendMessage(ctx, 'An error occurred while processing the file.');
        console.error('Error downloading file:', error);
      }
    }
    else{

      const userResponse = ctx.message.text
      sendEmail(ctx, userResponse, registeredEmail[ctx.chat.id]);
    }
    return ctx.scene.leave();
  }
)
// Register the wizard scenes
const stage = new Scenes.Stage([startWizard, updateWizard , sendWizard]);
bot.use(stage.middleware());

// Command handler for /start
bot.command('start', (ctx) => {
  chatId = ctx.chat.id
  if(registeredEmail[chatId]){
    ctx.reply("you've already registered use /update to update your email address")
  }
  else{
    ctx.scene.enter('start_wizard');
  }
});
// Command handler for /update
bot.command('update', (ctx) => {
  const chatId = ctx.chat.id;
  if(registeredEmail[chatId]){
    ctx.scene.enter('update_wizard');
  }
  else{
    ctx.reply('Please first register with the /start command.');
  }
});


// Command handler for /info
bot.command('info', (ctx) => {
  const chatId = ctx.chat.id;
  let response;
  if (registeredEmail[chatId]) {
    response = `Your registered email is: ${registeredEmail[chatId]}`;
  } else {
    response = "You haven't registered an email yet.";
  }
  ctx.reply(response);
});
// Command handler for /send
bot.command('send', (ctx) => {
  ctx.scene.enter('send_wizard');
  
});
// Command handler for /help
bot.command('help', (ctx) => {
  ctx.reply('Here is some help information.');
});


// Start the bot
bot.launch();

console.log('Bot is running...');
