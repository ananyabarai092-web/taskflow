const Task = require('../models/Task');

const PRIORITY_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 };

const ownershipCheck = async (id, userId) => {
  const task = await Task.findOne({ _id: id, isDeleted: false });
  if (!task) return { error: 'Task not found', status: 404 };
  if (task.userId.toString() !== userId) return { error: 'Not authorized', status: 403 };
  return { task };
};

// @desc Create task | POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, notes, priority, category, tags, deadline, reminderTime,
      isRecurring, recurringType, subtasks, timeEstimate, kanbanColumn } = req.body;

    const task = await Task.create({
      userId: req.user.id, title, description, notes, priority, category,
      tags: tags || [], deadline, reminderTime,
      isRecurring: isRecurring || false, recurringType: recurringType || 'none',
      subtasks: subtasks || [], timeEstimate: timeEstimate || 0,
      kanbanColumn: kanbanColumn || 'todo'
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get all tasks | GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { status, priority, category, tag, sortBy, search,
      archived, dateFrom, dateTo, page = 1, limit = 50 } = req.query;

    const query = { userId: req.user.id, isDeleted: false };
    query.isArchived = archived === 'true';

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (dateFrom || dateTo) {
      query.deadline = {};
      if (dateFrom) query.deadline.$gte = new Date(dateFrom);
      if (dateTo) query.deadline.$lte = new Date(dateTo);
    }

    let sort = {};
    if (sortBy === 'priority') sort = { priority: -1, deadline: 1 };
    else if (sortBy === 'deadline') sort = { deadline: 1 };
    else if (sortBy === 'smart') sort = { priority: -1, deadline: 1, createdAt: -1 };
    else sort = { createdAt: -1 };

    const skip = (page - 1) * limit;
    const tasks = await Task.find(query).sort(sort).limit(parseInt(limit)).skip(skip);
    const total = await Task.countDocuments(query);

    res.json({ success: true, count: tasks.length, total, page: parseInt(page), pages: Math.ceil(total / limit), tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get single task | GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update task | PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { task: existing, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Soft delete task | DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const hard = req.query.hard === 'true';
    if (hard) {
      await task.deleteOne();
    } else {
      await Task.findByIdAndUpdate(req.params.id, { isDeleted: true });
    }
    res.json({ success: true, message: hard ? 'Task permanently deleted' : 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Archive task | PUT /api/tasks/:id/archive
exports.archiveTask = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const updated = await Task.findByIdAndUpdate(req.params.id, { isArchived: true }, { new: true });
    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Restore archived task | PUT /api/tasks/:id/restore
exports.restoreTask = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const updated = await Task.findByIdAndUpdate(req.params.id, { isArchived: false, isDeleted: false }, { new: true });
    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Duplicate task | POST /api/tasks/:id/duplicate
exports.duplicateTask = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const { _id, createdAt, updatedAt, completedAt, reminderSent, ...data } = task.toObject();
    const duplicate = await Task.create({
      ...data,
      title: `${task.title} (Copy)`,
      status: 'pending',
      isArchived: false,
      isDeleted: false
    });
    res.status(201).json({ success: true, task: duplicate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Bulk actions | POST /api/tasks/bulk
exports.bulkAction = async (req, res) => {
  try {
    const { ids, action } = req.body;
    if (!ids?.length || !action) return res.status(400).json({ success: false, message: 'ids and action required' });

    const query = { _id: { $in: ids }, userId: req.user.id };
    let update = {};

    if (action === 'complete') update = { status: 'completed', completedAt: new Date() };
    else if (action === 'pending') update = { status: 'pending', completedAt: null };
    else if (action === 'archive') update = { isArchived: true };
    else if (action === 'delete') update = { isDeleted: true };
    else return res.status(400).json({ success: false, message: 'Invalid action' });

    const result = await Task.updateMany(query, update);
    res.json({ success: true, modified: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update subtask | PUT /api/tasks/:id/subtasks/:subtaskId
exports.updateSubtask = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' });

    Object.assign(subtask, req.body);
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Log time spent | PUT /api/tasks/:id/time
exports.logTime = async (req, res) => {
  try {
    const { task, error, status } = await ownershipCheck(req.params.id, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const { minutes } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $inc: { timeSpent: minutes } },
      { new: true }
    );
    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get task stats | GET /api/tasks/stats/overview
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const base = { userId, isDeleted: false, isArchived: false };

    const [total, completed, pending, overdue, archived] = await Promise.all([
      Task.countDocuments(base),
      Task.countDocuments({ ...base, status: 'completed' }),
      Task.countDocuments({ ...base, status: 'pending' }),
      Task.countDocuments({ ...base, status: 'pending', deadline: { $lt: new Date() } }),
      Task.countDocuments({ userId, isDeleted: false, isArchived: true })
    ]);

    // Weekly completion data (last 7 days)
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyTasks = await Task.find({
      userId, isDeleted: false, status: 'completed',
      completedAt: { $gte: weekAgo }
    }).select('completedAt');

    const weeklyData = Array(7).fill(0);
    weeklyTasks.forEach(t => {
      const dayIndex = 6 - Math.floor((Date.now() - new Date(t.completedAt)) / 86400000);
      if (dayIndex >= 0 && dayIndex < 7) weeklyData[dayIndex]++;
    });

    // Priority breakdown
    const priorityBreakdown = await Task.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), isDeleted: false, isArchived: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      stats: { total, completed, pending, overdue, archived, productivityScore, weeklyData, priorityBreakdown }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
