import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Members from './pages/Members';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { userInfo, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return userInfo ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { userInfo, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return userInfo && userInfo.role === 'admin' ? <>{children}</> : <Navigate to="/" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout>
                                <Dashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/tasks" element={
                        <ProtectedRoute>
                            <Layout>
                                <Tasks />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    <Route path="/members" element={
                        <AdminRoute>
                            <Layout>
                                <Members />
                            </Layout>
                        </AdminRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
