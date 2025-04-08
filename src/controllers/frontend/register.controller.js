const userModel = require('../../models/register.schema');
const bcrypt = require('bcrypt') //पासवर्ड को हैश करने के लिए।
var jwt = require('jsonwebtoken') //लॉगिन के बाद यूज़र को ऑथेंटिकेट करने के लिए।
var secretKey = "Gionee123" // JWT को सुरक्षित बनाने के लिए।
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yogeshsainijpr123@gmail.com', // Replace with your Gmail
        pass: 'ilcc tlzk emmo ksfg'  // Use App Password (not your Gmail password)
    }
});

// Generate and send OTP
const sendOTP = async (email) => {
    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Send OTP via email
    const mailOptions = {
        from: '"OTP Verification" <yogeshsainijpr123@gmail.com>',
        to: email,
        subject: 'Your OTP for Registration',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Account Verification</h2>
                <p>Your one-time password (OTP) for account verification is:</p>
                <div style="font-size: 24px; font-weight: bold; margin: 20px 0; padding: 15px; 
                     background: #f3f4f6; border-radius: 8px; text-align: center;">
                    ${otp}
                </div>
                <p style="color: #6b7280;">This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);

    return otp;
};

exports.register = async (request, response) => {
    try {
        const { name, email, mobile_number, password } = request.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return response.status(400).json({
                status: false,
                message: "Email ID already registered!"
            });
        }

        // Generate OTP

        const otp = await sendOTP(email);
        const otpExpires = Math.floor(Math.random() * 900000) + 100000;

        // Create new user with OTP (not verified yet)
        const newUser = new userModel({
            name,
            email,
            mobile_number,
            password: bcrypt.hashSync(password, 10),
            otp,
            otpExpires,
            isVerified: false
        });

        await newUser.save();

        response.status(200).json({
            status: true,
            message: "OTP sent to your email. Please verify to complete registration.",
            userId: newUser._id
        });

    } catch (error) {
        response.status(500).json({
            status: false,
            message: "Registration failed!",
            error: error.message
        });
    }
};

// OTP Verification
exports.verifyOTP = async (request, response) => {
    try {
        // Should only need these params
        const { userId, otp } = request.body;

        if (!userId || !otp) {
            return response.status(400).json({
                status: false,
                message: "User ID and OTP are required"
            });
        }

        // Rest of your verification logic...
    } catch (error) {
        response.status(500).json({
            status: false,
            message: "OTP verification failed!",
            error: error.message
        });
    }
};

// Resend OTP
exports.resendOTP = async (request, response) => {
    try {
        const { userId } = request.body;

        const user = await userModel.findById(userId);
        if (!user) {
            return response.status(404).json({
                status: false,
                message: "User not found!"
            });
        }

        // Generate new OTP
        const otp = await sendOTP(user.email);
        user.otp = otp;
        user.otpExpires = Date.now() + 600000; // 10 minutes
        await user.save();

        response.status(200).json({
            status: true,
            message: "New OTP sent to your email.",
            userId: user._id
        });

    } catch (error) {
        response.status(500).json({
            status: false,
            message: "Failed to resend OTP!",
            error: error.message
        });
    }
};

// Modified login to check verification status
exports.login = async (request, response) => {
    try {
        const { email, password } = request.body;

        const user = await userModel.findOne({ email });
        if (!user) {
            return response.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return response.status(403).json({
                status: false,
                message: "Please verify your account first. Check your email for OTP."
            });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return response.status(401).json({
                status: false,
                message: "Incorrect password"
            });
        }

        const token = jwt.sign({
            userData: user
        }, secretKey, { expiresIn: '1h' });

        response.status(200).json({
            status: true,
            message: "Login successful",
            token: token
        });

    } catch (error) {
        response.status(500).json({
            status: false,
            message: "Login failed",
            error: error.message
        });
    }
}

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

