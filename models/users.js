const mongoose = require('mongoose');

const UsersScheme = mongoose.Schema({
    fullname:{
        type: String,
        default: '',
    },
    username:{
        type: String,
        default: '',
    },
    email:{
        type: String,
        default: '',
    },
    phone:{
        type: String,
        default: '',
    },
    district:{
        type: String,
        default: '',
    },
    notificationtoken:{
        type: String,
        default: '',
    },
    pass:{
        type: String,
        default: '',
    },
    verifyToken:{
        type: String,
        default: '',
    },
    active:{
        type: String,
        default: false,
    },
});

module.exports = mongoose.model('Users', UsersScheme);