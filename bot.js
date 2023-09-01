require('dotenv').config();
const TelegramBot = require("node-telegram-bot-api");
const nodemailer = require('nodemailer');
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const transporter = nodemailer.createTransport({
    service : process.env.EMAIL_SERVICE,
    auth :{
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    }
})
// bot.on('message' , (msg)=>{
//     const chatId = msg.chat.id
//     const messageText = msg.text

//     if(messageText == '/start'){
//         bot.sendMessage(chatId , 'welcome to my node test bot')
//     }
//     else{

//         bot.sendMessage(chatId , messageText);
//     }
// });
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const commands = [
    { command: "/new", description: "to register you email" },
    { command: "/update", description: "change email" },
    { command: "/help", description: "if you seek help" },
  ];

  let commandsText = "Welcome to mailgram bot!\nHere are your commands:\n\n";

  commands.forEach((cmd) => {
    commandsText += `${cmd.command} - ${cmd.description}\n`;
  });

  bot.sendMessage(chatId, commandsText);
});

bot.onText(/\/new/, (msg) => {
  const chatId = msg.chat.id;
  bot
    .sendMessage(chatId, "your new email :")
    .then(bot.on('message', (msg) => {
        const chatId = msg.chat.id;
      
        // Check if the message is a text message
        if (msg.text) {
          const userResponse = msg.text;
          console.log('User replied with:', userResponse);
          
          bot.sendMessage(chatId, `You have successfully registered as : ${userResponse}`)
        }
      })).catch((error)=>{
        console.error(error);
      })
});

bot.onText(/\/update/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "the new email please : ").then(bot.on('message' , (msg) => {
    const chatId = msg.chat.id;
    if (msg.text) {
        const userResponse = msg.text
        bot.sendMessage(chatId , `You have successfully updated your email as : ${userResponse}`)
    }
  }));
});
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "You can send up to 25 MB in attachments. If your file is greater than 25 MB better to use Google Drive"
  );
});
