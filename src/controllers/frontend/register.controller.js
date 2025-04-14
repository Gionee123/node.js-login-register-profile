require('dotenv').config();
const userModel = require('../../models/register.schema');
const bcrypt = require('bcryptjs') //पासवर्ड को हैश करने के लिए।
var jwt = require('jsonwebtoken') //लॉगिन के बाद यूज़र को ऑथेंटिकेट करने के लिए।
var secretKey = process.env.JWT_SECRET; // JWT को सुरक्षित बनाने के लिए।
const nodemailer = require('nodemailer');
const OTPDATA = new Map();


const transporter = nodemailer.createTransport({

    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
        // pass: 'oxld vbwu btzo zlxq'
    }
});

exports.sendotp = async (request, response) => {
    const { email } = request.body;

    if (!email) {
        return response.status(400).json({ status: 1, msg: "Email is required" });
    }

    try {
        let otp = (Math.random() * 99999).toString().slice(0, 4)



        OTPDATA.set(email, otp);  // ✅ store OTP for that specific email

        await transporter.sendMail({
            from: 'yogeshsainijpr123@gmail.com',
            to: request.body.email,
            subject: 'Your OTP Verification Code',  // More descriptive subject
            text: `Your verification code is: ${otp}\n\nThis code expires in 10 minutes.`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px;">Please use the following code to verify your account:</p>
        
        <div style="background: #f8fafc; padding: 15px; text-align: center; margin: 20px 0; 
                    border-radius: 6px; font-size: 24px; font-weight: bold; letter-spacing: 2px;
                    border: 1px dashed #cbd5e1;">
            ${otp}
        </div>
        
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 20px;">
            If you didn't request this code, please ignore this email.
        </p>
    </div>`
        });

        response.status(200).json({ status: 0, msg: "OTP sent successfully" });

    } catch (error) {
        console.error("Error sending OTP:", error);
        response.status(500).json({ status: 1, msg: "Failed to send OTP", error: error.message });
    }


}

exports.register = async (request, response) => {
    const { name, email, mobileNumber, password, otp } = request.body;
    // Check if OTP matches
    const myotp = OTPDATA.get(email);
    console.log(myotp, otp, email)

    if (myotp == otp) {


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
            mobileNumber: request.body.mobileNumber,
            // otp: request.body.otp,
            password: bcrypt.hashSync(request.body.password, 10),
            // password: request.body.password,
            isVerified: true // <-- यह जोड़ो!

        })
        // यूज़र को डेटाबेस में सेव करें

        await data.save().then((result) => {
            // JWT टोकन जेनरेट करें

            var token = jwt.sign({
                userData: result
            },
                secretKey,
                { expiresIn: '1h' });

            OTPDATA.delete(email);

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
    else {
        return response.status(400).json({
            status: false,
            msg: "Invalid OTP"
        });
    }

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



// फॉरगॉट पासवर्ड का रिक्वेस्ट हैंडल करने वाला फंक्शन
// exports.forgotPassword = async (request, response) => {
//     try {
//         const { email } = request.body;

//         // 1. डेटाबेस में यूजर को ईमेल के आधार पर खोजें
//         const user = await userModel.findOne({ email });

//         // अगर यूजर नहीं मिला तो
//         if (!user) {
//             // सफल रेस्पॉन्स भेजें (सुरक्षा के लिए असली स्थिति नहीं बताते)
//             return response.status(200).json({
//                 status: true,
//                 message: "If your email is registered, you will receive a password reset link"
//             });
//         }

//         // 2. रैंडम पासवर्ड रीसेट टोकन जनरेट करें
//         const resetToken = user();

//         // वैलिडेशन के बिना यूजर को सेव करें (क्योंकि पासवर्ड फील्ड अपडेट नहीं हो रहा)
//         await user.save({ validateBeforeSave: false });

//         // 3. यूजर को ईमेल भेजें
//         // फ्रंटएंड के रीसेट पासवर्ड पेज का URL बनाएं
//         const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

//         // ईमेल का कॉन्फिगरेशन सेट करें
//         const mailOptions = {
//             from: process.env.EMAIL_USERNAME,  // भेजने वाला का ईमेल
//             to: user.email,                   // प्राप्तकर्ता का ईमेल
//             subject: 'Your password reset token (valid for 10 minutes)',  // ईमेल का विषय
//             text: `Forgot your password? Click the link below to reset your password:\n\n${resetURL}\n\nIf you didn't forget your password, please ignore this email!`  // ईमेल का संदेश
//         };

//         // नोडमेलर का उपयोग करके ईमेल भेजें
//         await transporter.sendMail(mailOptions);

//         // सफलता की रेस्पॉन्स भेजें
//         response.status(200).json({
//             status: true,
//             message: "Password reset link sent to your email"
//         });

//         // अगर कोई एरर आए तो
//     } catch (error) {
//         // 500 स्टेटस कोड के साथ एरर रेस्पॉन्स भेजें
//         response.status(500).json({
//             status: false,
//             message: "Error sending email",
//             error: error.message  // डेवलपमेंट के लिए एरर डिटेल
//         });
//     }
// }
// exports.resetPassword = async (request, response) => {

//     try {
//         const { token, newPassword } = request.body;

//         // 1. Get user based on the token
//         const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//         const user = await userModel.findOne({
//             passwordResetToken: hashedToken,
//             passwordResetExpires: { $gt: Date.now() }
//         });

//         // 2. If token has not expired, and there is user, set the new password
//         if (!user) {
//             return response.status(400).json({
//                 status: false,
//                 message: "Token is invalid or has expired"
//             });
//         }

//         // 3. Update password and clear reset token
//         user.password = newPassword;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;
//         await user.save();

//         // 4. Log the user in, send JWT
//         const authToken = jwt.sign(
//             { id: user._id },
//             secretKey,
//             { expiresIn: '1h' }
//         );

//         response.status(200).json({
//             status: true,
//             message: "Password reset successful",
//             token: authToken
//         });
//     } catch (error) {
//         response.status(500).json({
//             status: false,
//             message: "Password reset failed",
//             error: error.message
//         });
//     }
// }