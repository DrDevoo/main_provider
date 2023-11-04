const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const multer = require('multer');
const Users = require('../models/users');
const Mail = require('../routes/mail');
const upload = multer({ dest: './uploaded/' })
const { uploadFile } = require('./s3')

//registration
router.post("/register", async (req, res) => {
    try {
        console.log(req.body)
        const oldmail = req.body.email
        const oldUser = await Users.findOne({ email:oldmail });
        if (oldUser) {
            return res.send({ok: false,msg: "isreged"});
        }else {
            encryptedPassword = await bcrypt.hash(req.body.password, 10);
            const newuser = await Users.create({  
                fullname: req.body.fullname,
                username: req.body.username,
                phone: req.body.phone,
                district: req.body.district,
                notificationtoken: req.body.notificationToken,
                email: req.body.email,
                pass:encryptedPassword
            });
            res.json({
                status: "ok",
                user: newuser
            });
            Mail.sendVerifyMail(newuser)
        }
    }catch(err){
        res.json({ message: err });
        console.log(err)
    }
})

//UploadimgTESZT
router.post("/sendimg",upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        console.log(file)
        const result = await uploadFile(file);
        
        res.json({
            result
        });
    } catch (e) {
        console.log(e)
    }
});

//resendcode
router.post("/resendcode", async (req, res) => {
    try {
        const user = await Users.findById(req.body.id);
        Mail.sendVerifyMail(user)
    }catch(err){
        res.json({ message: err });
        console.log(err)
    }
})

//verify
router.post("/verify", async (req, res) => {
    try {
        const user = await Users.findById(req.body.id);
        const token = req.body.token
        if (user.verifyToken == token) {
            await Users.findOneAndUpdate(    
               { email: user.email},
               { $set:
                    {
                         active: true,
                    }
               }
          ); 
            res.send({
                ok: true,
                msg: "verfysuccess"
            });
        } else {
            res.send({
                ok: false,
                msg: "notsuccess"
            });
        }
    }catch(err){
        res.json({ message: err });
        console.log(err)
    }finally{
       console.log("felhasznalo visszaigazolva!")   
    }
})

//login
router.post("/login", async (req, res) => {
    const email = req.body.email
    const pass = req.body.password
    const user = await Users.findOne({ email });
    try {
        if (user && (await bcrypt.compare(pass, user.password))) {
            if (user.active == "true") {
                 const token = jwt.sign({
                id: user._id,
                roles: user.role,
            }, "jwtPrivateKey", { expiresIn: "8h" });
            res.send({
                ok: true,
                token: token,
                user:user
            });
            } else {
                res.send({
                ok: false,
                token: null,
                    msg: "noverfyed",
                id: user._id
            });
            }
        }else{
            res.send({
                ok: false,
                token: null,
                msg:"err"
            });
      }
    }catch(err){
        res.json({ message: err });
        console.log(err)
    }
})

router.get("/", async (req, res) => {
    res.send({
        ok: true,
    });
});

module.exports = router;