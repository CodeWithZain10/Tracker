import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Trash2, UserPlus, TrendingUp, X } from 'lucide-react';
import './Members.css';

interface Member {
    _id: string;
    user: { _id: string; name: string; email: string };
    assignedPlatforms: string[];
    stats: {
        facebook: { reach: number; followers: number; engagement: number };
        linkedin: { reach: number; followers: number; engagement: number };
    };
}

const Members: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showStatsForm, setShowStatsForm] = useState<Member | null>(null);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        platforms: ['Facebook', 'LinkedIn']
    });

    const [statsData, setStatsData] = useState({
        facebook: { reach: 0, followers: 0, engagement: 0 },
        linkedin: { reach: 0, followers: 0, engagement: 0 }
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const { data } = await api.get('/members');
            setMembers(data);
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/members', {
                ...formData,
                assignedPlatforms: formData.platforms
            });
            setShowAddForm(false);
            setFormData({ name: '', email: '', password: '', platforms: ['Facebook', 'LinkedIn'] });
            fetchMembers();
        } catch (err) {
            alert('Failed to add member');
        }
    };

    const handleDeleteMember = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this member?')) {
            try {
                await api.delete(`/members/${id}`);
                fetchMembers();
            } catch (err) {
                alert('Failed to delete member');
            }
        }
    };

    const handleUpdateStats = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showStatsForm) return;
        try {
            await api.put(`/members/${showStatsForm._id}/stats`, { stats: statsData });
            setShowStatsForm(null);
            fetchMembers();
        } catch (err) {
            alert('Failed to update stats');
        }
    };

    const openStatsModal = (member: Member) => {
        setShowStatsForm(member);
        setStatsData(member.stats);
    };

    if (loading) return <div className="loading">Loading team members...</div>;

    return (
        <div className="members-container">
            <header className="page-header">
                <div>
                    <h1>Team Members</h1>
                    <p>Manage your agency's team and track their performance.</p>
                </div>
                <button className="add-btn" onClick={() => setShowAddForm(true)}>
                    <UserPlus size={20} />
                    <span>Add Member</span>
                </button>
            </header>

            <div className="members-grid">
                {members.map(member => (
                    <div className="member-card card" key={member._id}>
                        <div className="member-info">
                            <div className="member-avatar-large">{member.user.name[0]}</div>
                            <h3>{member.user.name}</h3>
                            <p>{member.user.email}</p>
                            <div className="platforms">
                                {member.assignedPlatforms.map(p => (
                                    <span key={p} className={`platform-badge ${p.toLowerCase()}`}>{p}</span>
                                ))}
                            </div>
                        </div>
                        
                        <div className="member-stats-summary">
                            <div className="platform-stat">
                                <h4>Facebook</h4>
                                <div className="stat-row">
                                    <span>Reach: <strong>{member.stats.facebook.reach}</strong></span>
                                    <span>Eng: <strong>{member.stats.facebook.engagement}</strong></span>
                                </div>
                            </div>
                            <div className="platform-stat">
                                <h4>LinkedIn</h4>
                                <div className="stat-row">
                                    <span>Reach: <strong>{member.stats.linkedin.reach}</strong></span>
                                    <span>Eng: <strong>{member.stats.linkedin.engagement}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="member-actions">
                            <button className="action-btn stats" onClick={() => openStatsModal(member)}>
                                <TrendingUp size={18} />
                                <span>Update Stats</span>
                            </button>
                            <button className="action-btn delete" onClick={() => handleDeleteMember(member._id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Member Modal */}
            {showAddForm && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h2>Add New Member</h2>
                            <button className="close-btn" onClick={() => setShowAddForm(false)}><X /></button>
                        </div>
                        <form onSubmit={handleAddMember}>
                            <div className="form-group">
                                <label>Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    required 
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <button type="submit" className="submit-btn">Create Account</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Stats Modal */}
            {showStatsForm && (
                <div className="modal-overlay">
                    <div className="modal-content card">
                        <div className="modal-header">
                            <h2>Update Stats: {showStatsForm.user.name}</h2>
                            <button className="close-btn" onClick={() => setShowStatsForm(null)}><X /></button>
                        </div>
                        <form onSubmit={handleUpdateStats}>
                            <div className="stats-sections">
                                <div className="platform-section fb">
                                    <h3>Facebook Performance</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Reach</label>
                                            <input type="number" value={statsData.facebook.reach} onChange={e => setStatsData({...statsData, facebook: {...statsData.facebook, reach: parseInt(e.target.value)}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Followers</label>
                                            <input type="number" value={statsData.facebook.followers} onChange={e => setStatsData({...statsData, facebook: {...statsData.facebook, followers: parseInt(e.target.value)}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Engagement</label>
                                            <input type="number" value={statsData.facebook.engagement} onChange={e => setStatsData({...statsData, facebook: {...statsData.facebook, engagement: parseInt(e.target.value)}})} />
                                        </div>
                                    </div>
                                </div>
                                <div className="platform-section li">
                                    <h3>LinkedIn Performance</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Reach</label>
                                            <input type="number" value={statsData.linkedin.reach} onChange={e => setStatsData({...statsData, linkedin: {...statsData.linkedin, reach: parseInt(e.target.value)}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Followers</label>
                                            <input type="number" value={statsData.linkedin.followers} onChange={e => setStatsData({...statsData, linkedin: {...statsData.linkedin, followers: parseInt(e.target.value)}})} />
                                        </div>
                                        <div className="form-group">
                                            <label>Engagement</label>
                                            <input type="number" value={statsData.linkedin.engagement} onChange={e => setStatsData({...statsData, linkedin: {...statsData.linkedin, engagement: parseInt(e.target.value)}})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="submit-btn">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
