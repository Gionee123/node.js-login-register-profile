const express = require('express')
const route = express.Router();
const usercontroller = require("../../controllers/frontend/register.controller");

module.exports = app => {
    route.post('/sendotp', usercontroller.sendotp);
    route.post('/register', usercontroller.register);
    route.post('/login', usercontroller.login);
    route.post('/profile', usercontroller.profile);
    // route.post('/verifyOTP', usercontroller.profile);
    // route.post('/resendOTP', usercontroller.profile);

    app.use('/api/frontend/users', route)
}