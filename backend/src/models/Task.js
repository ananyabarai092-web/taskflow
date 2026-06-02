const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: [true, 'Task title is required'], trim: true },
  description: { type: String, trim: true },
  notes: { type: String, trim: true },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  category: { type: String, trim: true, default: 'General' },
  tags: [{ type: String, trim: true }],
  deadline: { type: Date },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  isArchived: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  reminderTime: { type: Date },
  reminderSent: { type: Boolean, default: false },
  isRecurring: { type: Boolean, default: false },
  recurringType: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' },
  subtasks: [subtaskSchema],
  attachments: [{ name: String, url: String, uploadedAt: { type: Date, default: Date.now } }],
  timeEstimate: { type: Number, default: 0 }, // minutes
  timeSpent: { type: Number, default: 0 },    // minutes
  order: { type: Number, default: 0 },
  kanbanColumn: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' }
}, { timestamps: true });

taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

taskSchema.index({ userId: 1, status: 1, isArchived: 1, isDeleted: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ userId: 1, tags: 1 });

module.exports = mongoose.model('Task', taskSchema);
