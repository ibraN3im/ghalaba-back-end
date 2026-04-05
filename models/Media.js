import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    altText: {
        type: String,
        default: ''
    },
    size: {
        type: Number,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;
