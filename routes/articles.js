import express from 'express';
import slugify from 'slugify';
import Article from '../models/Article.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/articles
// @desc    Get all articles (public)
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, featured } = req.query;

        let query = { status: 'published' };

        if (category) {
            query.category = category;
        }

        if (featured === 'true') {
            query.$and = [
                { isBreaking: true },
                {
                    $or: [
                        { breakingExpiresAt: null },
                        { breakingExpiresAt: { $gt: new Date() } }
                    ]
                }
            ];
        }

        if (search) {
            query.$text = { $search: search };
        }

        const articles = await Article.find(query)
            .sort({ publishedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Article.countDocuments(query);

        res.json({
            articles,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/articles/latest
// @desc    Get latest articles
// @access  Public
router.get('/latest', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const articles = await Article.find({ status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(parseInt(limit));
        res.json(articles);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// @route   GET /api/articles/popular
// @desc    Get popular articles by views
// @access  Public
router.get('/popular', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const articles = await Article.find({ status: 'published' })
            .sort({ views: -1 })
            .limit(parseInt(limit));
        res.json(articles);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

// @route   GET /api/articles/:slug
// @desc    Get single article by slug
// @access  Public
router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Increment views
        article.views += 1;
        await article.save();

        res.json(article);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/articles
// @desc    Create new article
// @access  Private (Admin & Editor)
router.post('/', protect, async (req, res) => {
    try {
        const { title, summary, content, featuredImage, videoUrl, category, tags, isBreaking, publishedAt, author, status } = req.body;

        // Generate slug from Arabic or English title
        const slug = slugify(title.ar || title.en, { lower: true, strict: true });

        // For editors, force author to be the current user
        let authorData = author;
        if (req.user.role === 'editor') {
            authorData = {
                id: req.user._id.toString(),
                name: req.user.name
            };
        }

        const article = new Article({
            slug,
            title,
            summary,
            content,
            featuredImage,
            videoUrl,
            category,
            tags,
            isBreaking,
            publishedAt,
            author: authorData,
            status
        });

        await article.save();
        res.status(201).json(article);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Private (Admin & Editor - own articles only)
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, summary, content, featuredImage, videoUrl, category, tags, isBreaking, publishedAt, status } = req.body;

        let article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Check permissions for editors
        if (req.user.role === 'editor') {
            // Editors can only edit their own articles
            if (article.author.id !== req.user._id.toString()) {
                return res.status(403).json({
                    message: 'غير مصرح لك بتعديل هذا المقال. يمكنك فقط تعديل المقالات التي كتبتها.'
                });
            }
        }

        // Update slug if title changed
        if (title && (title.ar !== article.title.ar || title.en !== article.title.en)) {
            req.body.slug = slugify(title.ar || title.en, { lower: true, strict: true });
        }

        article = await Article.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        res.json(article);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Private (Admin & Editor - own articles only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Check permissions for editors
        if (req.user.role === 'editor') {
            // Editors can only delete their own articles
            if (article.author.id !== req.user._id.toString()) {
                return res.status(403).json({
                    message: 'غير مصرح لك بحذف هذا المقال. يمكنك فقط حذف المقالات التي كتبتها.'
                });
            }
        }

        await article.deleteOne();
        res.json({ message: 'Article removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
