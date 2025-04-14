const mongoose = require('mongoose');
//आप बार-बार एक ही ईमेल पर मेल भेज सकते हैं।
const registerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },
    mobileNumber: {
        type: String,
        required: [true, "mobile number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"]
    }
    ,
    password: {
        type: String,
        required: [true, "password is required"],
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,

    },
    otpExpires: {
        type: Date
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});
const registerModel = mongoose.model("register", registerSchema);
module.exports = registerModel;


