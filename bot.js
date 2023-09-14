
require("dotenv").config();

const { Telegraf, Markup, Scenes, session } = require('telegraf');
const axios = require('axios')
const {sendEmail , sendFileToEmail} = require('./functions/sendMail')
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let attempts = 5;
var registeredEmail = [];

bot.use(session());

function sendMessage(ctx, text) {
  ctx.reply(text);
}


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

const stage = new Scenes.Stage([startWizard, updateWizard , sendWizard]);
bot.use(stage.middleware());

// Command for /start
bot.command('start', (ctx) => {
  chatId = ctx.chat.id
  if(registeredEmail[chatId]){
    ctx.reply("you've already registered use /update to update your email address")
  }
  else{
    ctx.scene.enter('start_wizard');
  }
});

bot.command('update', (ctx) => {
  const chatId = ctx.chat.id;
  if(registeredEmail[chatId]){
    ctx.scene.enter('update_wizard');
  }
  else{
    ctx.reply('Please first register with the /start command.');
  }
});

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

bot.command('send', (ctx) => {
  ctx.scene.enter('send_wizard');
  
});

bot.command('help', (ctx) => {
  ctx.reply('Here is some help information.');
});

bot.launch();

console.log('Bot is running...');
