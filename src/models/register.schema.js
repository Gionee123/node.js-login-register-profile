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
    },
});
const registerModel = mongoose.model("register", registerSchema);
module.exports = registerModel;


