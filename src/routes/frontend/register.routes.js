const express = require('express')
const route = express.Router();
const usercontroller = require("../../controllers/frontend/register.controller");

module.exports = app => {
    route.post('/sendotp', usercontroller.sendotp); //http://localhost:5000/api/frontend/users/sendotp
    route.post('/register', usercontroller.register); //http://localhost:5000/api/frontend/users/register
    route.post('/login', usercontroller.login); //http://localhost:5000/api/frontend/users/login
    route.post('/profile', usercontroller.profile); //http://localhost:5000/api/frontend/users/profile
    // route.post('/verifyOTP', usercontroller.verifyOTP); //http://localhost:5000/api/frontend/users/verifyOTP
    // route.post('/resendOTP', usercontroller.resendOTP); //http://localhost:5000/api/frontend/users/resendOTP

    app.use('/api/frontend/users', route)
}