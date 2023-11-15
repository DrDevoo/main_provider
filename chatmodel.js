const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: Array, required: true },
  timestamp: { type: Date, default: Date.now },
});

chatSchema.statics.getConversation = async function (userId1, userId2) {
  const conversations = await this.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  }).sort('timestamp');

  return conversations;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
