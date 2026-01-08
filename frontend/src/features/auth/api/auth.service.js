import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL;

export const authService = {
    // Sends Google idToken to backend
    loginWithGoogle: async (googleToken) => {
        const response = await axios.post(`${API_URL}/auth/google`, {
            token: googleToken
        });
        return response.data; // Returns { token, user }
    }
};