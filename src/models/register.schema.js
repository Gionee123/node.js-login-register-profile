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
    mobile_number: {
        type: String,
        required: [true, "mobile number is required"],
        match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"]
    }
    ,
    password: {
        type: String,
        required: [true, "password is required"],
    },
    status: {
        type: Boolean,
        default: true
    }, otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false // डिफॉल्ट रूप से वेरिफाइड नहीं होता
    },
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    lockUntil: {
        type: Date,
        select: false
    },
    userId: {
        type: String,
        unique: true
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


