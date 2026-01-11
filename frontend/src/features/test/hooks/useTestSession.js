import { useState } from 'react';
import { testService } from '../api/test.service';

export const useTestSession = () => {
    const [test, setTest] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { [questionId]: answer }
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Start a test by type
    const startTest = async (type, languageCode) => {
        setIsLoading(true);
        try {
            let data;
            if (type === 'writing') data = await testService.createWritingTest(languageCode);
            else if (type === 'reading') data = await testService.createReadingTest(languageCode);
            else if (type === 'speaking') data = await testService.createSpeakingTest(languageCode);

            setTest(data);
            setCurrentQuestionIndex(0);
            setAnswers({});
            setResult(null);
        } catch (error) {
            console.error("Failed to start test:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = (answer) => {
        if (!test) return;
        const question = test.questions[currentQuestionIndex];
        setAnswers(prev => ({ ...prev, [question._id || currentQuestionIndex]: answer }));

        // Move to next
        if (currentQuestionIndex < test.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const submitTest = async () => {
        if (!test) return;
        setIsLoading(true);
        try {
            const resultData = await testService.submitTest(test._id, answers);
            setResult(resultData);
            setTest(null); // Clear active test
        } catch (error) {
            console.error("Failed to submit test:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        test,
        currentQuestionIndex,
        currentQuestion: test ? test.questions[currentQuestionIndex] : null,
        totalQuestions: test ? test.questions.length : 0,
        answers,
        startTest,
        submitAnswer,
        submitTest,
        isLoading,
        result,
        reset: () => { setTest(null); setResult(null); }
    };
};
