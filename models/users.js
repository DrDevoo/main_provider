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
    acctype:{
        type: String,
        default: '',
    },
    profileImg:{
        type: String,
        default: 'none',
        required: true
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
    job:{
        type: String,
        default: '',
    },
    city:{
        type: String,
        default: '',
    },
    addresse:{
        type: String,
        default: '',
    },
    street:{
        type: String,
        default: '',
    },
});

module.exports = mongoose.model('Users', UsersScheme);