const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// GET all tasks
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST create new task
router.post('/', auth, async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    try {
        const { title, priority } = req.body;
        const newTask = new Task({ title, priority, user: req.user.id });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT update task (toggle completion)
router.put('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ error: 'Task not found' });

        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
