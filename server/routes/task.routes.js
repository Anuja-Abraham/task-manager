const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Helper to check access
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return false;
  return project.members.some(m => m.user.toString() === userId) || project.createdBy.toString() === userId;
};

// GET /api/tasks (get all tasks for projects the user has access to)
// Can filter by ?project=xyz
router.get('/', auth, async (req, res) => {
  try {
    const { project } = req.query;
    
    if (project) {
      const hasAccess = await checkProjectAccess(project, req.user.userId);
      if (!hasAccess) return res.status(403).json({ message: 'Not authorized for this project' });
      
      const tasks = await Task.find({ project }).populate('assignedTo', 'name email').populate('project', 'name');
      return res.json(tasks);
    }

    // Default: return tasks assigned to me or all tasks in my projects
    // To keep it simple, return all tasks in projects I'm a member of
    const myProjects = await Project.find({
      $or: [{ createdBy: req.user.userId }, { 'members.user': req.user.userId }]
    });
    const projectIds = myProjects.map(p => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/tasks
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, project } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Title and project are required' });
    }

    const hasAccess = await checkProjectAccess(project, req.user.userId);
    if (!hasAccess) return res.status(403).json({ message: 'Not authorized for this project' });

    const newTask = new Task({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo: assignedTo || null,
      project,
      createdBy: req.user.userId
    });

    const savedTask = await newTask.save();
    
    // Populate before sending back
    await savedTask.populate('assignedTo', 'name email');
    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const member = project.members.find(m => m.user.toString() === req.user.userId);
    
    const isAdmin = project.createdBy.toString() === req.user.userId || (member && member.role === 'admin');
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.userId;

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Members can only update status. Admins can update everything.
    const updates = req.body;
    if (!isAdmin) {
      // Member is only allowed to change status
      task.status = updates.status || task.status;
    } else {
      task.title = updates.title !== undefined ? updates.title : task.title;
      task.description = updates.description !== undefined ? updates.description : task.description;
      task.dueDate = updates.dueDate !== undefined ? updates.dueDate : task.dueDate;
      task.priority = updates.priority !== undefined ? updates.priority : task.priority;
      task.status = updates.status !== undefined ? updates.status : task.status;
      task.assignedTo = updates.assignedTo !== undefined ? updates.assignedTo : task.assignedTo;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const member = project.members.find(m => m.user.toString() === req.user.userId);
    const isAdmin = project.createdBy.toString() === req.user.userId || (member && member.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
