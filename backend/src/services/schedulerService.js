const cron = require('node-cron');
const Task = require('../models/Task');

// Check for tasks that need reminders (runs every 15 minutes)
const scheduleReminders = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const next15Min = new Date(now.getTime() + 15 * 60000);
      const tasks = await Task.find({
        reminderTime: { $gte: now, $lte: next15Min },
        reminderSent: false,
        status: 'pending'
      }).populate('userId', 'email name');

      for (const task of tasks) {
        try {
          const { sendTaskReminder } = require('./emailService');
          await sendTaskReminder(task.userId.email, task);
          task.reminderSent = true;
          await task.save();
        } catch (error) {
          // silently skip email errors
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error.message);
    }
  });
  console.log('Reminder scheduler started');
};

// Handle recurring tasks (runs daily at midnight)
const handleRecurringTasks = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const completedRecurringTasks = await Task.find({
        isRecurring: true,
        status: 'completed',
        recurringType: { $in: ['daily', 'weekly'] }
      });

      for (const task of completedRecurringTasks) {
        const newDeadline = new Date(task.deadline);
        if (task.recurringType === 'daily') newDeadline.setDate(newDeadline.getDate() + 1);
        else if (task.recurringType === 'weekly') newDeadline.setDate(newDeadline.getDate() + 7);

        await Task.create({
          userId: task.userId,
          title: task.title,
          description: task.description,
          priority: task.priority,
          category: task.category,
          deadline: newDeadline,
          status: 'pending',
          isRecurring: true,
          recurringType: task.recurringType
        });
      }
    } catch (error) {
      console.error('Recurring task error:', error.message);
    }
  });
  console.log('Recurring task handler started');
};

module.exports = { scheduleReminders, handleRecurringTasks };
