import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserInfo {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    token: string;
}

interface AuthContextType {
    userInfo: UserInfo | null;
    login: (userData: UserInfo) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            setUserInfo(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData: UserInfo) => {
        setUserInfo(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = () => {
        setUserInfo(null);
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ userInfo, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
