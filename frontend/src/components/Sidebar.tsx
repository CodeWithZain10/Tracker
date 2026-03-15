import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    CheckSquare, 
    Users, 
    LogOut,
    Menu
} from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    const { userInfo, logout } = useAuth();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Bytes Limited</h2>
            </div>
            
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <LayoutDashboard size={20} />
                    <span>Overview</span>
                </NavLink>
                
                <NavLink to="/tasks" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                    <CheckSquare size={20} />
                    <span>Tasks</span>
                </NavLink>
                
                {userInfo?.role === 'admin' && (
                    <NavLink to="/members" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <Users size={20} />
                        <span>Members</span>
                    </NavLink>
                )}
            </nav>
            
            <div className="sidebar-footer">
                <div className="user-info">
                    <p className="user-name">{userInfo?.name}</p>
                    <p className="user-role">{userInfo?.role}</p>
                </div>
                <button onClick={logout} className="logout-btn">
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
