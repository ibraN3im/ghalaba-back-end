import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const { name, email, role, isActive, password } = req.body;

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateData = { name, email, role, isActive };

        // Only update password if provided
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.deleteOne();
        res.json({ message: 'User removed' });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});

export default router;
