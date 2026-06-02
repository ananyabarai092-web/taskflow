const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String, required: [true, 'Email is required'], unique: true, lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
  settings: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    emailNotifications: { type: Boolean, default: true },
    reminderNotifications: { type: Boolean, default: true },
    defaultView: { type: String, enum: ['list', 'kanban', 'calendar'], default: 'list' }
  },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  dailyGoal: { type: Number, default: 5 },
  weeklyGoal: { type: Number, default: 20 },
  productivityScore: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
