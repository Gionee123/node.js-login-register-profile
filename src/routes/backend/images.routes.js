const express = require('express')//Express.js फ्रेमवर्क को इम्पोर्ट करता है।
const route = express.Router(); // Router बनाता है ताकि हम API के अलग-अलग रूट्स बना सकें।
const imagesController = require("../../controllers/backend/images.controller");
const multer = require('multer')
const path = require('path'); //Path मॉड्यूल इम्पोर्ट करता है, जिससे फाइल का एक्सटेंशन और पाथ हैंडल किया जा सके।
const upload = multer({ dest: 'uploads/Images' }) //अपलोड की गई फाइल को uploads/Images फोल्डर में सेव करेगा।

// Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/Images'); // फाइल को "uploads/Images" फोल्डर में सेव करेगा
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now(); // हर फाइल को यूनिक बनाने के लिए टाइमस्टैम्प जोड़ रहे हैं।
        var imagepath = path.extname(file.originalname); // फाइल का ओरिजिनल एक्सटेंशन निकाल रहे हैं (जैसे .jpg, .png)
        cb(null, file.fieldname + '-' + uniqueSuffix + imagepath); // नया फाइल नाम सेट कर रहे हैं।
    }
});


// Multer Middleware
const uploadImage = multer({ storage: storage }).single('imageUrl'); //.single('imageUrl') का मतलब है कि यह API सिर्फ़ "imageUrl" नाम की एक फाइल ही एक्सेप्ट करेगी।


module.exports = app => {
    route.post("/add", uploadImage, imagesController.create);
    route.post("/view", imagesController.view);

    app.use('/api/backend/login_image', route)
}