const {bot} = require('../bot')
const {sendEmail , sendFileToEmail} = require('../functions/sendMail')
function handleSend(msg){

        const chatId = msg.chat.id;
      
        bot.sendMessage(chatId, "Send a file or an email");
      
        bot.on("message", (msg) => {
          sendEmail(chatId, msg.text);
        });
        bot.on("document", (msg) => {
          const chatId = msg.chat.id;
          const fileId = msg.document.file_id;
          const fileName = msg.document.file_name;
      
          // Fetch the file by its file ID
          bot.getFile(fileId).then((fileInfo) => {
            const fileStream = bot.getFileStream(fileId);
      
            // Read the file stream into a buffer
            let fileBuffer = Buffer.from([]);
            fileStream.on("data", (chunk) => {
              fileBuffer = Buffer.concat([fileBuffer, chunk]);
            });
      
            fileStream.on("end", () => {
              sendFileToEmail(
                chatId,
                "abdulazizredi1993@gmail.com",
                fileBuffer,
                fileName
              );
            });
          });
        });
      
}
module.exports = handleSend