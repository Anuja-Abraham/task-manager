const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/projects
router.get('/', auth, async (req, res) => {
  try {
    // Find projects where user is creator or a member
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    }).populate('members.user', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/projects
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const newProject = new Project({
      name,
      description,
      createdBy: req.user.userId,
      members: [{
        user: req.user.userId,
        role: 'admin' // Creator is automatically an admin
      }]
    });

    const project = await newProject.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/projects/:id/members (Add member)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if current user is admin of this project
    const currentMember = project.members.find(m => m.user.toString() === req.user.userId);
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    // Check if already a member
    if (project.members.some(m => m.user.toString() === userToAdd._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userToAdd._id, role: role || 'member' });
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/projects/:id/members/:userId (Remove member)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Check if current user is admin
    const currentMember = project.members.find(m => m.user.toString() === req.user.userId);
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    // Don't allow removing oneself if they are the creator maybe? 
    // For now just allow removing by filtering out the member
    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET Dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get all projects user is part of
    const projects = await Project.find({
      $or: [
        { createdBy: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });
    
    const projectIds = projects.map(p => p._id);

    // Get tasks for those projects
    const tasks = await Task.find({ project: { $in: projectIds } });

    // Calculate stats
    const totalTasks = tasks.length;
    const todoTasks = tasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = tasks.filter(t => t.status === 'inprogress').length;
    const doneTasks = tasks.filter(t => t.status === 'done').length;

    const myTasks = tasks.filter(t => t.assignedTo && t.assignedTo.toString() === req.user.userId);
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');

    res.json({
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      myTasks: myTasks.length,
      overdueTasks: overdueTasks.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
