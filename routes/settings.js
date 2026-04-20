import express from 'express';
import Settings from '../models/Settings.js';
import VisitorStats from '../models/VisitorStats.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get site settings
// @access  Public
router.get('/', async (req, res) => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default ones
        if (!settings) {
            settings = new Settings({
                siteName: { ar: 'الغلابه', en: 'Ghalaba' },
                contactEmail: 'ghalaba@gmail.com',
                description: {
                    ar: 'جريدة إلكترونية شاملة تقدم آخر الأخبار والتحليلات من مختلف المجالات',
                    en: 'A comprehensive digital newspaper that provides the latest news and analyses from various fields'
                }
            });
            await settings.save();
        }

        res.json(settings);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/settings
// @desc    Update site settings
// @access  Private
router.put('/', protect, async (req, res) => {
    try {
        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings(req.body);
            await settings.save();
        } else {
            settings = await Settings.findByIdAndUpdate(
                settings._id,
                req.body,
                { new: true, runValidators: true }
            );
        }

        res.json(settings);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
