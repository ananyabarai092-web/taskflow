const User = require('../models/User');
const Task = require('../models/Task');
const bcrypt = require('bcryptjs');

// @desc Get profile | GET /api/users/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update profile | PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Update settings | PUT /api/users/settings
exports.updateSettings = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings: req.body, dailyGoal: req.body.dailyGoal, weeklyGoal: req.body.weeklyGoal },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Change password | PUT /api/users/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get productivity analytics | GET /api/users/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Last 30 days daily completion
    const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(now.getDate() - 30);
    const completedTasks = await Task.find({
      userId, isDeleted: false, status: 'completed',
      completedAt: { $gte: thirtyDaysAgo }
    }).select('completedAt timeSpent priority category');

    // Daily data
    const dailyMap = {};
    completedTasks.forEach(t => {
      const day = new Date(t.completedAt).toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });

    // Category breakdown
    const categoryMap = {};
    completedTasks.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
    });

    // Total time spent
    const totalTimeSpent = completedTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);

    // Streak calculation
    const user = await User.findById(userId);
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
    const yStr = yesterday.toISOString().split('T')[0];
    const completedToday = dailyMap[today] > 0;
    const completedYesterday = dailyMap[yStr] > 0;

    let streak = user.streak || 0;
    if (completedToday) {
      if (!completedYesterday && streak === 0) streak = 1;
      else if (completedYesterday) streak = streak;
    } else {
      streak = 0;
    }
    await User.findByIdAndUpdate(userId, { streak, lastActiveDate: now });

    res.json({
      success: true,
      analytics: {
        dailyCompletion: dailyMap,
        categoryBreakdown: categoryMap,
        totalTimeSpent,
        streak,
        completedLast30Days: completedTasks.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
