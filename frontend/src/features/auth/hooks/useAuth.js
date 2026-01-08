import { useState, useEffect } from 'react';
import { authService } from '../api/auth.service';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, [token]);

    const handleGoogleLogin = async (idToken) => {
        try {
            const data = await authService.loginWithGoogle(idToken);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setToken(data.token);
            setUser(data.user);
            return data;
        } catch (error) {
            console.error("HOOK: Auth failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setToken(null);
    };

    return { user, token, handleGoogleLogin, logout, isLoading, isAuthenticated: !!token };
};