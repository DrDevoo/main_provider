//express framework
const express = require('express');
const app = express();
//depeds
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const socketIO = require('socket.io');

//uses
require('dotenv').config();
app.use(bodyParser.json());

//Adatbazis kapcsolat
mongoose.set("strictQuery", false);
mongoose.connect(
    process.env.MONGO, 
    () => {console.log('--Adatbazis kapcsolat: '+mongoose.connection.readyState+'--')
});

//Kapcsolt komponensek
const usersRoute = require('./routes/users');

//Kulso komponensel hasznalata
app.use('/users', usersRoute)

//Autentikalt index oldal
app.get("/", (req, res) => {
  res.status(200).send("NOTIFYMATE API 0.0.1 🙌 ");
});

app.get('/conversations/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const conversations = await Chat.find({ $or: [{ senderId: userId }, { receiverId: userId }] });
    const participants = new Set(conversations.flatMap((chat) => [chat.senderId, chat.receiverId]));
    const participantsArray = Array.from(participants).filter((participant) => participant !== userId);

    res.json(participantsArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

//Szerver certificates
const httpServer = http.createServer(app);
//Az app nyitott portjai
httpServer.listen(3000, () => {
  console.log('---HTTP gerinc szerver elerheto a 3900 porton---');
});
try {
  const httpsServer = https.createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/hengersordiak.hu/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/hengersordiak.hu/fullchain.pem'),
}, app);
httpsServer.listen(400, () => {
  console.log('---HTTPS gerinc szerver elerheto a 444 porton---');
});
} catch (e) {
  console.log("HTTPS kapcsolat nem lehetséges")
}
const Chat = require('./chatmodel');
const io = socketIO(httpServer,{
  cors: {
      origin: "http://localhost:450",
      credentials: true,
  },
});

const users = {};

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('login', (userId) => {
    users[userId] = socket.id;
    io.emit('update users', Object.keys(users));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
    const disconnectedUserId = Object.keys(users).find((key) => users[key] === socket.id);
    if (disconnectedUserId) {
      delete users[disconnectedUserId];
      io.emit('update users', Object.keys(users));
    }
  });

  socket.on('private message', async ({ senderId, receiverId, message }) => {
    console.log("Üzenet érkezett be: "+message+" Tól: "+senderId+" Neki: "+receiverId)
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('private message', { senderId, message });

      // Mentjük a beszélgetést a MongoDB adatbázisba
      const chat = new Chat({ senderId, receiverId, message });
      await chat.save();
    } else {
      console.log("NEM elérheto masik fel")
            // Mentjük a beszélgetést a MongoDB adatbázisba
      const chat = new Chat({ senderId, receiverId, message });
      await chat.save();
    }
  });

  socket.on('get conversation', async ({ userId1, userId2 }) => {
    try {
      const conversation = await Chat.getConversation(userId1, userId2);
      socket.emit('conversation', conversation);
    } catch (error) {
      console.error(error);
    }
  });
});