const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String, // Store the URL of the image
        // required: true
    }, status: {
        type: Boolean,
        default: true
    },
});

const ImageModel = mongoose.model('loginsingleImage', imageSchema);

module.exports = ImageModel;
