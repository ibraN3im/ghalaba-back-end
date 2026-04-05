import express from 'express';
import Media from '../models/Media.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/media
// @desc    Get all media
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type, page = 1, limit = 20 } = req.query;

        let query = {};
        if (type) {
            query.type = type;
        }

        const media = await Media.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Media.countDocuments(query);

        res.json({
            media,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/media
// @desc    Create media entry
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { url, type, title, altText, size } = req.body;

        const media = new Media({
            url,
            type,
            title,
            altText,
            size,
            uploadedBy: req.user._id
        });

        await media.save();
        res.status(201).json(media);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/media/:id
// @desc    Delete media
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        await media.deleteOne();
        res.json({ message: 'Media removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
