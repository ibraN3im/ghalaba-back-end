import express from 'express';
import Article from '../models/Article.js';
import VisitorStats from '../models/VisitorStats.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/stats/dashboard
// @desc    Get dashboard aggregated statistics
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
    try {
        // Build query based on role
        let query = { status: 'published' };
        if (req.user && req.user.role === 'editor') {
            query['author.id'] = req.user._id.toString();
        }

        const totalArticles = await Article.countDocuments(query);
        
        const articles = await Article.find(query).select('views isBreaking title category author publishedAt featuredImage');
        
        let totalViews = 0;
        let breakingNewsCount = 0;
        
        articles.forEach(article => {
            totalViews += (article.views || 0);
            if (article.isBreaking) {
                breakingNewsCount++;
            }
        });

        const topArticles = [...articles]
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);

        const recentArticles = [...articles]
            .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            .slice(0, 5);

        // Visitor stats (only admin might see global visitors, but we'll return it anyway, or restrict if editor)
        // If editor, maybe they just see 0 or we return global stats
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        const visitorStats = await VisitorStats.find({ date: { $gte: startDate } }).sort({ date: 1 });

        res.json({
            totalArticles,
            totalViews,
            breakingNewsCount,
            topArticles,
            recentArticles,
            visitorStats
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/stats/visitors
// @desc    Get visitor statistics
// @access  Public
router.get('/visitors', async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        const stats = await VisitorStats.find({
            date: { $gte: startDate }
        }).sort({ date: 1 });

        res.json(stats);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/stats/track
// @desc    Track visitor
// @access  Public
router.post('/track', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let stats = await VisitorStats.findOne({ date: today });

        if (!stats) {
            stats = new VisitorStats({
                date: today,
                count: 1,
                uniqueVisitors: 1,
                pageViews: 1
            });
        } else {
            stats.count += 1;
            stats.pageViews += 1;
        }

        await stats.save();
        res.json({ success: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
