import React from 'react';
import { FaEdit, FaTrash, FaCheck, FaUndo } from 'react-icons/fa';
import { format } from 'date-fns';
import '../styles/TaskList.css';

const TaskList = ({ tasks, onDelete, onEdit, onStatusToggle }) => {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const isOverdue = (deadline, status) => {
    return status === 'pending' && new Date(deadline) < new Date();
  };

  if (tasks.length === 0) {
    return <div className="no-tasks">No tasks found. Create your first task!</div>;
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <div
          key={task._id}
          className={`task-card ${task.status === 'completed' ? 'completed' : ''} ${
            isOverdue(task.deadline, task.status) ? 'overdue' : ''
          }`}
        >
          <div className="task-header">
            <h3>{task.title}</h3>
            <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          {task.description && <p className="task-description">{task.description}</p>}
          <div className="task-meta">
            <span className="task-category">{task.category}</span>
            <span className="task-deadline">
              Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
            </span>
          </div>
          <div className="task-actions">
            <button
              className={`btn-icon ${task.status === 'completed' ? 'btn-undo' : 'btn-complete'}`}
              onClick={() => onStatusToggle(task)}
              title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
            >
              {task.status === 'completed' ? <FaUndo /> : <FaCheck />}
            </button>
            <button className="btn-icon btn-edit" onClick={() => onEdit(task)} title="Edit task">
              <FaEdit />
            </button>
            <button className="btn-icon btn-delete" onClick={() => onDelete(task._id)} title="Delete task">
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
