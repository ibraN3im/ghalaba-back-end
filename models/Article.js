import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    title: {
        ar: { type: String, required: true },
        en: { type: String, required: true }
    },
    summary: {
        ar: { type: String, required: true },
        en: { type: String, required: true }
    },
    content: {
        ar: { type: String, required: true },
        en: { type: String, required: true }
    },
    featuredImage: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    tags: [{
        type: String
    }],
    isBreaking: {
        type: Boolean,
        default: false,
        index: true
    },
    breakingExpiresAt: {
        type: Date,
        default: null
    },
    views: {
        type: Number,
        default: 0
    },
    publishedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    author: {
        id: { type: String, required: true },
        name: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'published'
    }
}, {
    timestamps: true
});

// Index for better search performance
articleSchema.index({ title: 'text', content: 'text' });

const Article = mongoose.model('Article', articleSchema);

export default Article;
