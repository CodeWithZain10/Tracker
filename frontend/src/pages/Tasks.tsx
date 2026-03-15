import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    Plus, 
    Filter, 
    Calendar, 
    Target, 
    CheckSquare, 
    Square,
    Facebook,
    Linkedin,
    Info,
    Trash2
} from 'lucide-react';
import './Tasks.css'; // Correcting extension in thought, should be .css
import './Tasks.css';

interface Task {
    _id: string;
    title: string;
    assignedTo: { _id: string; user: { name: string } };
    platform: 'Facebook' | 'LinkedIn' | 'General';
    dueDate: string;
    targetNumber: number;
    unit: string;
    notes: string;
    status: 'Pending' | 'In Progress' | 'Done' | 'Overdue';
    progress: number;
    isCompleted: boolean;
}

const Tasks: React.FC = () => {
    const { userInfo } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterPlatform, setFilterPlatform] = useState('All');
    const [filterMember, setFilterMember] = useState('All');

    const [formData, setFormData] = useState({
        title: '',
        assignedTo: '',
        platform: 'General',
        dueDate: '',
        targetNumber: 10,
        unit: 'clients',
        notes: ''
    });

    useEffect(() => {
        fetchTasks();
        if (userInfo?.role === 'admin') {
            fetchMembers();
        }
    }, []);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const { data } = await api.get('/members');
            setMembers(data);
        } catch (err) {
            console.error('Error fetching members:', err);
        }
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks', formData);
            setShowAddForm(false);
            setFormData({ title: '', assignedTo: '', platform: 'General', dueDate: '', targetNumber: 10, unit: 'clients', notes: '' });
            fetchTasks();
        } catch (err) {
            alert('Failed to assign task');
        }
    };

    const handleUpdateProgress = async (taskId: string, progress: number, isCompleted?: boolean) => {
        try {
            await api.put(`/tasks/${taskId}`, { progress, isCompleted });
            fetchTasks();
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    };

    const handleDeleteTask = async (id: string) => {
        if (window.confirm('Delete this task?')) {
            try {
                await api.delete(`/tasks/${id}`);
                fetchTasks();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        const matchesPlatform = filterPlatform === 'All' || task.platform === filterPlatform;
        const matchesMember = filterMember === 'All' || task.assignedTo?._id === filterMember;
        return matchesStatus && matchesPlatform && matchesMember;
    });

    if (loading) return <div className="loading">Loading tasks...</div>;

    return (
        <div className="tasks-container">
            <header className="page-header">
                <div>
                    <h1>Tasks</h1>
                    <p>Manage and track daily agency tasks.</p>
                </div>
                {userInfo?.role === 'admin' && (
                    <button className="add-btn" onClick={() => setShowAddForm(true)}>
                        <Plus size={20} />
                        <span>Assign Task</span>
                    </button>
                )}
            </header>

            <div className="filters-bar card">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                        <option value="Overdue">Overdue</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
                        <option value="All">All Platforms</option>
                        <option value="Facebook">Facebook</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="General">General</option>
                    </select>
                </div>
                {userInfo?.role === 'admin' && (
                    <div className="filter-group">
                        <select value={filterMember} onChange={e => setFilterMember(e.target.value)}>
                            <option value="All">All Members</option>
                            {members.map(m => (
                                <option key={m._id} value={m._id}>{m.user.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="tasks-list">
                {filteredTasks.map(task => (
                    <div className={`task-card card ${task.status.toLowerCase()}`} key={task._id}>
                        <div className="task-header">
                            <div className="task-identity">
                                <span className={`platform-icon ${task.platform.toLowerCase()}`}>
                                    {task.platform === 'Facebook' ? <Facebook size={16} /> : task.platform === 'LinkedIn' ? <Linkedin size={16} /> : <Target size={16} />}
                                </span>
                                <h3>{task.title}</h3>
                            </div>
                            <span className={`status-badge ${task.status.toLowerCase()}`}>{task.status}</span>
                        </div>
                        
                        <div className="task-details">
                            <div className="detail-item">
                                <Calendar size={16} />
                                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item">
                                <Info size={16} />
                                <span>Target: {task.targetNumber} {task.unit}</span>
                            </div>
                            {userInfo?.role === 'admin' && (
                                <div className="detail-item">
                                    <Target size={16} />
                                    <span>To: {task.assignedTo?.user?.name}</span>
                                </div>
                            )}
                        </div>

                        {task.notes && <p className="task-notes">{task.notes}</p>}

                        <div className="task-progress-section">
                            <div className="progress-header">
                                <span>Progress: {task.progress} / {task.targetNumber}</span>
                                <span>{Math.round((task.progress / task.targetNumber) * 100)}%</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div 
                                    className="progress-bar-fill" 
                                    style={{ 
                                        width: `${Math.min(100, (task.progress / task.targetNumber) * 100)}%`,
                                        backgroundColor: task.platform === 'Facebook' ? 'var(--fb-blue)' : task.platform === 'LinkedIn' ? 'var(--li-green)' : 'var(--primary-color)'
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="task-actions">
                            <div className="completion-controls">
                                <button 
                                    className={`checkbox-btn ${task.isCompleted ? 'checked' : ''}`}
                                    onClick={() => handleUpdateProgress(task._id, task.progress, !task.isCompleted)}
                                >
                                    {task.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                                    <span>Done</span>
                                </button>
                                <div className="number-input">
                                    <input 
                                        type="number" 
                                        value={task.progress} 
                                        max={task.targetNumber}
                                        min={0}
                                        onChange={(e) => handleUpdateProgress(task._id, parseInt(e.target.value) || 0)}
                                    />
                                    <span>/ {task.targetNumber}</span>
                                </div>
                            </div>
                            {userInfo?.role === 'admin' && (
                                <button className="delete-task-btn" onClick={() => handleDeleteTask(task._id)}>
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Task Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h2>Assign New Task</h2>
                            <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleAddTask}>
                            <div className="form-group">
                                <label>Task Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. 10 clients ko Facebook pe approach karo" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Assigned To</label>
                                    <select required value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                                        <option value="">Select Member</option>
                                        {members.map(m => <option key={m._id} value={m._id}>{m.user.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Platform</label>
                                    <select value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value as any})}>
                                        <option value="General">General</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Due Date</label>
                                    <input type="date" required value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label>Target Number</label>
                                    <input type="number" required value={formData.targetNumber} onChange={e => setFormData({...formData, targetNumber: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. clients, posts" />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                            </div>
                            <button type="submit" className="submit-btn">Assign Task</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
