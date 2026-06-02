const express = require('express');
const router = express.Router();
const {
  createTask, getTasks, getTask, updateTask, deleteTask,
  archiveTask, restoreTask, duplicateTask, bulkAction,
  updateSubtask, logTime, getTaskStats
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats/overview', getTaskStats);
router.post('/bulk', bulkAction);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

router.put('/:id/archive', archiveTask);
router.put('/:id/restore', restoreTask);
router.post('/:id/duplicate', duplicateTask);
router.put('/:id/time', logTime);
router.put('/:id/subtasks/:subtaskId', updateSubtask);

module.exports = router;
