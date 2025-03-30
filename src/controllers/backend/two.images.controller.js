const imageModel = require('../../models/two.images.schema')

// two image tabing
exports.create = async (request, response) => {
    console.log("Request Body:", request.body)
    console.log("Uploaded Files:", request.files)


    var data = new imageModel({
        name: request.body.name,
    });
    // ✅ Front Images Save करें
    if (request.files && request.files.frontImage && request.files.frontImage.length > 0) {
        data.frontImage = request.files.frontImage.map(file => file.filename); // सभी filenames को array में स्टोर करें
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
    try {
        const categories = await imageModel.find(); // imageModel.find() के जरिए सभी डेटा फेच कर रहे हैं।
        response.status(200).json({ // डेटा मिल गया, तो 200 (OK) स्टेटस के साथ JSON रिस्पॉन्स देंगे।
            success: true,
            message: "Categories fetched successfully!",
            imagepath: "http://localhost:5000/uploads/Tabingcategory/",

            data: categories
        });
    } catch (error) {
        //कोई एरर आया, तो 500 स्टेटस के साथ एरर दिखाएंगे।
        response.status(500).json({
            success: false,
            message: "Error fetching categories!",
            error: error.message
        });
    }

}