const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateSettings, changePassword, getAnalytics } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/settings', updateSettings);
router.put('/password', changePassword);
router.get('/analytics', getAnalytics);

module.exports = router;
