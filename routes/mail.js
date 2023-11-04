require("dotenv").config();
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const fs = require('fs');
const path = require('path')

const Users = require('../models/users');

let transporter = nodemailer.createTransport({
   host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
const handlebarOptions = {
     viewEngine: {
         partialsDir: path.resolve('./routes/mails/'),
         defaultLayout: false,
     },
     viewPath: path.resolve('./routes/mails/'),
};
transporter.use('compile', hbs(handlebarOptions))

async function generateToken() {
    var minm = 100000;
    var maxm = 999999;
    return Math.floor(Math
    .random() * (maxm - minm + 1)) + minm;
}

//verify email
async function sendVerifyMail(user) {
    try {
        token = await generateToken()
        message = {
          from: "no-reply@hengersordiak.hu",
          to: user.email,
          subject: "E-mail cím megerősítése",
          template: 'verify',
          context:{
            email: user.email,
            fullname: user.fullname,
            token: token,
          }
        }
        await Users.findOneAndUpdate(    
               { email: user.email},
               { $set:
                    {
                         verifyToken: token,
                    }
               }
          ); 
        transporter.sendMail(message)
     }catch (e) {
        console.log(e)
     }
}

module.exports = { sendVerifyMail }