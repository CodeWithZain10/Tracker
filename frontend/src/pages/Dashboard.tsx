import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    ListTodo,
    Facebook,
    Linkedin
} from 'lucide-react';
import './Dashboard.css';

interface Stats {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
}

interface Member {
    _id: string;
    user: { name: string; email: string };
    stats: {
        facebook: { reach: number; followers: number; engagement: number };
        linkedin: { reach: number; followers: number; engagement: number };
    };
}

const Dashboard: React.FC = () => {
    const { userInfo } = useAuth();
    const [tasks, setTasks] = useState<any[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tasksRes = await api.get('/tasks');
                setTasks(tasksRes.data);
                
                if (userInfo?.role === 'admin') {
                    const membersRes = await api.get('/members');
                    setMembers(membersRes.data);
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userInfo]);

    const getStats = (): Stats => {
        const stats = { total: tasks.length, completed: 0, pending: 0, overdue: 0 };
        tasks.forEach(task => {
            if (task.status === 'Done') stats.completed++;
            else if (task.status === 'Overdue') stats.overdue++;
            else stats.pending++;
        });
        return stats;
    };

    const stats = getStats();

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Welcome back, {userInfo?.name}!</h1>
                <p>Here's what's happening with Bytes Limited today.</p>
            </header>

            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon total"><ListTodo /></div>
                    <div className="stat-info">
                        <h3>Total Tasks</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon completed"><CheckCircle2 /></div>
                    <div className="stat-info">
                        <h3>Completed</h3>
                        <p>{stats.completed}</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon pending"><Clock /></div>
                    <div className="stat-info">
                        <h3>Pending</h3>
                        <p>{stats.pending}</p>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon overdue"><AlertCircle /></div>
                    <div className="stat-info">
                        <h3>Overdue</h3>
                        <p>{stats.overdue}</p>
                    </div>
                </div>
            </div>

            {userInfo?.role === 'admin' && (
                <section className="members-performance">
                    <div className="section-header">
                        <h2>Team Performance</h2>
                    </div>
                    <div className="performance-table card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th><div className="th-platform"><Facebook size={16} color="#1877f2" /> Facebook</div></th>
                                    <th><div className="th-platform"><Linkedin size={16} color="#0a66c2" /> LinkedIn</div></th>
                                    <th>Completion Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map(member => {
                                    const memberTasks = tasks.filter(t => t.assignedTo?._id === member._id);
                                    const done = memberTasks.filter(t => t.status === 'Done').length;
                                    const rate = memberTasks.length > 0 ? Math.round((done / memberTasks.length) * 100) : 0;
                                    
                                    return (
                                        <tr key={member._id}>
                                            <td>
                                                <div className="member-cell">
                                                    <div className="member-avatar">{member.user.name[0]}</div>
                                                    <div>
                                                        <p className="name">{member.user.name}</p>
                                                        <p className="email">{member.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stats-badges">
                                                    <span>{member.stats.facebook.reach} Reach</span>
                                                    <span>{member.stats.facebook.engagement} Eng.</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="stats-badges">
                                                    <span>{member.stats.linkedin.reach} Reach</span>
                                                    <span>{member.stats.linkedin.engagement} Eng.</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="progress-cell">
                                                    <div className="progress-bar-bg">
                                                        <div className="progress-bar-fill" style={{ width: `${rate}%` }}></div>
                                                    </div>
                                                    <span>{rate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default Dashboard;
