const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deactivateUser,
  activateUser,
  deleteUser,
  getAllTasks,
  getAnalytics,
  generateReports
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

router.get('/users', getAllUsers);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/activate', activateUser);
router.delete('/users/:id', deleteUser);
router.get('/tasks', getAllTasks);
router.get('/analytics', getAnalytics);
router.get('/reports', generateReports);

module.exports = router;
