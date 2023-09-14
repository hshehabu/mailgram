const bot = require("../bot");

function handleHelp(msg) {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "You can send up to 25 MB in attachments. If your file is greater than 25 MB better to use Google Drive"
  );
}

module.exports = handleHelp;
