const userModel = require('../../models/register.schema');
const bcrypt = require('bcrypt') //पासवर्ड को हैश करने के लिए।
var jwt = require('jsonwebtoken') //लॉगिन के बाद यूज़र को ऑथेंटिकेट करने के लिए।
var secretKey = "Gionee123" // JWT को सुरक्षित बनाने के लिए।

exports.register = async (request, response) => {

    const existingUser = await userModel.findOne({ email: request.body.email }); //सबसे पहले चेक करता है कि यूज़र पहले से रजिस्टर है या नहीं।

    if (existingUser) {
        return response.status(400).json({
            status: false,
            message: "Email ID already registered!" //अगर ईमेल पहले से मौजूद है, तो "Email ID already registered!" मैसेज भेजता है।

        });
    }

    // नया यूज़र बनाएं
    var data = new userModel({
        name: request.body.name,
        email: request.body.email,
        mobile_number: request.body.mobile_number,
        password: bcrypt.hashSync(request.body.password, 10),
    })
    // यूज़र को डेटाबेस में सेव करें

    await data.save().then((result) => {
        // JWT टोकन जेनरेट करें

        var token = jwt.sign({
            userData: result
        },
            secretKey,
            { expiresIn: '1h' });

        response.status(201).json({
            status: true,
            message: "User registered successfully!",
            token: token
        });
    }).catch((error) => {
        response.status(500).json({
            status: false,
            message: "Registration failed!",
            error: error.message
        });
    })
}

exports.login = async (request, response) => {
    await userModel.findOne({ email: request.body.email })

        .then((result) => {

            if (result) {

                var comparePassword = bcrypt.compareSync(request.body.password, result.password);
                if (comparePassword) {
                    var token = jwt.sign({
                        userData: result
                    },
                        secretKey,
                        { expiresIn: '1h' });


                    var resp = {
                        status: true,
                        message: "login successfully",
                        token: token,
                    }
                }
                else {
                    var resp = {
                        status: false,
                        message: "incorrect password",
                    }
                }

            }
            else {
                var resp = {
                    status: false,
                    message: "no user found",
                    result: result
                }
            }
            response.send(resp)
        })

        .catch((error) => {
            response.status(500).json({
                status: false,
                message: "Something went wrong!",
                error: error.message
            });
        });

};

exports.profile = async (request, response) => {
    try {
        let token = request.headers.authorization;

        if (!token || token === "") {
            return response.status(401).json({
                status: false,
                token_error: true,
                message: "Token required",
            });
        }

        // Remove 'Bearer ' from token if present
        token = token.replace("Bearer ", "");

        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                return response.status(401).json({
                    status: false,
                    token_error: true,
                    message: "Invalid or expired token",
                });
            }

            // ✅ Response सिर्फ एक बार भेजा जाएगा
            return response.json({
                status: true,
                token_error: false,
                message: "Token verified successfully",
                data: decoded,
            });
        });

    } catch (error) {
        // 🔴 अगर कोई भी अन्य एरर आती है तो उसे catch करेंगे
        console.error("Server Error:", error);

        return response.status(500).json({
            status: false,
            token_error: true,
            message: "Internal Server Error",
        });
    }
};

