const mongoose = require('mongoose');

const TaabingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    frontImage: {
        type: [String], // ✅ Multiple Images के लिए Array
        required: true
    },

    //जब नया डेटा डाटाबेस में स्टोर होगा, तो created_at में उस समय की तारीख और समय (Timestamp) अपने-आप सेव हो जाएगा।
    created_at: {
        type: Date,
        default: Date.now
    },
    //डेटा कब अपडेट हुआ, इसे ट्रैक करता है।
    updated_at: {
        type: Date,
        default: Date.now
    },
    //वह तारीख स्टोर करेगा जब डेटा डिलीट किया जाएगा।
    deleted_at: {
        type: Date,
        default: '' //डिफ़ॉल्ट में खाली ('') रखा गया है ताकि जब तक डेटा डिलीट ना हो, इसमें कुछ भी स्टोर न हो।
    }, status: {
        type: Boolean,
        default: true
    },
});

const ImageModel = mongoose.model('loginfrontImage', TaabingSchema);

module.exports = ImageModel;
