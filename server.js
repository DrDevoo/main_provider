//express framework
const express = require('express');
const app = express();
//depeds
const https = require('https');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

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