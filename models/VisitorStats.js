import mongoose from 'mongoose';

const visitorStatsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    },
    uniqueVisitors: {
        type: Number,
        default: 0
    },
    pageViews: {
        type: Number,
        default: 0
    }
});

const VisitorStats = mongoose.model('VisitorStats', visitorStatsSchema);

export default VisitorStats;
