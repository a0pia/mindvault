
import React, { createContext, useContext, useState, useEffect } from 'react';
import { localDb } from '../services/localDb';

interface UserContextType {
    user: any;
    updateUser: (data: any) => void;
    toggleTheme: () => void;
    loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const profile = localDb.getUserProfile();
        setUser(profile);
        document.documentElement.setAttribute('data-theme', profile.theme || 'light');
        setLoading(false);
    }, []);

    const updateUser = (data: any) => {
        localDb.updateUserProfile(data);
        setUser((prev: any) => {
            const newUser = { ...prev, ...data };
            if (data.theme) document.documentElement.setAttribute('data-theme', data.theme);
            return newUser;
        });
    };

    const toggleTheme = () => {
        const newTheme = user.theme === 'dark' ? 'light' : 'dark';
        updateUser({ theme: newTheme });
    };

    return (
        <UserContext.Provider value={{ user, updateUser, toggleTheme, loading }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
