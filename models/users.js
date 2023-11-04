const mongoose = require('mongoose');

const UsersScheme = mongoose.Schema({
    lastname:{
        type: String,
        default: '',
    },
    firstname:{
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
    pass:{
        type: String,
        default: '',
    },
});

module.exports = mongoose.model('Users', UsersScheme);