const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(userResponse) {
  if (emailRegex.test(userResponse)) {
    return true;
  } else {
    bot.sendMessage(chatId, "invalid email");
  }
}
module.exports = isValidEmail;