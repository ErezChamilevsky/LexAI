import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../api/auth.service';
import api from '../../../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch fresh user data
    const refreshUser = useCallback(async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            // If we have a user in state, usage that email, otherwise usage stored
            const email = user?.email || storedUser?.email;

            if (!email) return;

            const response = await api.get(`/users/${email}`);
            const freshUser = response.data;

            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
            return freshUser;
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    }, [user]);

    // Init Auth
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');
            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                // Optional: Validate token or fetch fresh user immediately
                // For now, assume stored user is "okay" strictly for init, but trigger refresh
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    // Effect: If token/user exists, ensure we are in sync (optional, avoided loop)

    const handleGoogleLogin = async (idToken) => {
        try {
            const data = await authService.loginWithGoogle(idToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error("PROVIDER: Auth failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        isLoading,
        refreshUser,
        handleGoogleLogin,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
