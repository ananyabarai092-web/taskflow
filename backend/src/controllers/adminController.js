const User = require('../models/User');
const Task = require('../models/Task');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate user
// @route   PUT /api/admin/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User activated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete all user tasks
    await Task.deleteMany({ userId: req.params.id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and associated tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks (admin)
// @route   GET /api/admin/tasks
// @access  Private/Admin
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('userId', 'name email');
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const overdueTasks = await Task.countDocuments({
      status: 'pending',
      deadline: { $lt: new Date() }
    });

    // Tasks by priority
    const highPriority = await Task.countDocuments({ priority: 'High' });
    const mediumPriority = await Task.countDocuments({ priority: 'Medium' });
    const lowPriority = await Task.countDocuments({ priority: 'Low' });

    res.json({
      success: true,
      analytics: {
        users: { total: totalUsers, active: activeUsers },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          overdue: overdueTasks
        },
        priority: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate reports
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.generateReports = async (req, res) => {
  try {
    const { type } = req.query;

    let report;
    switch (type) {
      case 'completed':
        report = await Task.find({ status: 'completed' }).populate('userId', 'name email');
        break;
      case 'pending':
        report = await Task.find({ status: 'pending' }).populate('userId', 'name email');
        break;
      case 'overdue':
        report = await Task.find({
          status: 'pending',
          deadline: { $lt: new Date() }
        }).populate('userId', 'name email');
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid report type' });
    }

    res.json({ success: true, type, count: report.length, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
