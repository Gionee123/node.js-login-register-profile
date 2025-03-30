const imageModel = require('../../models/images.scema')
var jwt = require('jsonwebtoken') //लॉगिन के बाद यूज़र को ऑथेंटिकेट करने के लिए।
var secretKey = "Gionee123" // JWT को सुरक्षित बनाने के लिए।
// single image

exports.create = async (request, response) => {
    console.log(request.body)//request.body में टेक्स्ट डेटा आएगा (जैसे name)।
    console.log(request.files) //request.file में अपलोड की गई इमेज का डेटा होगा।



    var data = new imageModel({
        name: request.body.name,
    });
    if (request.file != undefined) {
        if (request.file.filename != "") {
            data.imageUrl = request.file.filename;
        }


    }
    await data.save() //data.save() से MongoDB में डेटा सेव कर रहे हैं।
        .then((result) => {
            //अगर सेव सफल हुआ, तो 201 (Created) स्टेटस के साथ JSON रिस्पॉन्स देंगे।
            response.status(201).json({
                success: true,
                message: "Category created successfully!",
                data: result
            });
        })
        .catch((error) => {
            //अगर कोई एरर आया, तो 500 (Internal Server Error) के साथ एरर मैसेज भेजेंगे।
            response.status(500).json({
                success: false,
                message: "Error creating category!",
                error: error.message
            });
        });
};
exports.view = async (request, response) => {
    console.log("Received Token:", request.headers.authorization.split(' ')[1]);
    const token = request.headers.authorization.split(' ')[1]; // request.headers.authorization से टोकन को निकालता है।


    //अगर टोकन मौजूद ही नहीं है
    if (token == undefined) {
        var res = {
            status: false,
            token_error: true,
            message: "token required"
        }
        response.send(res)

    }
    //अगर टोकन खाली है 
    if (token == "") {
        var res = {
            status: false,
            token_error: true,
            message: "invalid token required"
        }
        response.send(res)

    }
    //टोकन को वेरिफाई करना
    jwt.verify(token, secretKey, async (error, decoded) => {
        if (error) {
            var res = {
                status: false,
                token_error: true,
                message: "Incorrect Token"
            };
            response.send(res)
        }
        else {
            console.log(decoded)
        }

        // टोकन वैलिड है, डेटा फ़ेच करें
        try {
            const categories = await imageModel.find(); // डेटाबेस से डेटा फ़ेच करें
            response.status(200).json({
                success: true,
                message: "कैटेगरीज़ सफलतापूर्वक प्राप्त हुईं!",
                imagepath: "http://localhost:5000/uploads/images/",
                userDetails: decoded, // डिकोडेड यूजर डिटेल्स को रिस्पॉन्स में शामिल करें
                data: categories
            });
        } catch (error) {
            // डेटाबेस एरर को हैंडल करें
            response.status(500).json({
                success: false,
                message: "कैटेगरीज़ प्राप्त करने में त्रुटि!",
                error: error.message
            });
        }
    });

}