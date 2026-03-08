import api from '../../../services/api';

export const authService = {
    // Sends Google idToken to backend
    loginWithGoogle: async (googleToken) => {
        const response = await api.post(`/auth/google`, {
            token: googleToken
        });
        return response.data; // Returns { token, user }
    }
};