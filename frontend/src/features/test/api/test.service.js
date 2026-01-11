import api from '../../../services/api';

export const testService = {
    // Create new test
    createWritingTest: async (languageCode) => {
        const response = await api.post('/tests/writing', { languageCode });
        return response.data;
    },
    createReadingTest: async (languageCode) => {
        const response = await api.post('/tests/reading', { languageCode });
        return response.data;
    },
    createSpeakingTest: async (languageCode) => {
        const response = await api.post('/tests/speaking', { languageCode });
        return response.data;
    },

    // Submit test answers
    submitTest: async (testId, answers) => {
        const response = await api.post(`/tests/${testId}/submit`, { answers });
        return response.data;
    }
};
