import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    siteName: {
        ar: { type: String, required: true },
        en: { type: String, required: true }
    },
    contactEmail: {
        type: String,
        required: true
    },
    description: {
        ar: { type: String, default: '' },
        en: { type: String, default: '' }
    },
    socialLinks: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        youtube: { type: String, default: '' }
    },
    tickerSpeed: {
        type: Number,
        default: 50
    },
    articlesPerPage: {
        type: Number,
        default: 10
    },
    enableComments: {
        type: Boolean,
        default: true
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    showBreakingTicker: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
