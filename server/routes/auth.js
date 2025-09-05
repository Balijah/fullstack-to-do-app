const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({ email, passwordHash });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
        res.status(201).json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;




