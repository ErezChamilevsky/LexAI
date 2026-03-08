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
            setAnswers({}); // We'll keep local answers state as {id: text} for UI ease
            setResult(null);
        } catch (error) {
            console.error("Failed to start test:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = (answer) => {
        if (!test || !test.content) return;
        const question = test.content[currentQuestionIndex];
        const qId = question.question_id;

        setAnswers(prev => ({ ...prev, [qId]: answer }));

        // Move to next
        if (currentQuestionIndex < test.content.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const submitTest = async (finalAnswer) => {
        if (!test) return;
        setIsLoading(true);
        try {
            // Include final answer if provided
            let finalAnswers = { ...answers };
            if (finalAnswer !== undefined) {
                const qId = test.content[currentQuestionIndex].question_id;
                finalAnswers[qId] = finalAnswer;
            }

            // Convert local answers { id: text } to backend format [{ question_id, answer }]
            const formattedAnswers = Object.entries(finalAnswers).map(([question_id, answer]) => ({
                question_id,
                answer
            }));

            console.log("Submitting test answers to backend...", formattedAnswers);
            const resultData = await testService.submitTest(test._id, formattedAnswers);
            console.log("Received result from backend:", resultData);
            setResult(resultData);
            setTest(null); // Clear active test
        } catch (error) {
            console.error("Failed to submit test:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Mock speaking record logic
    const mockRecordSpeaking = async () => {
        setIsLoading(true);
        // Simulate a delay for "processing audio"
        return new Promise((resolve) => {
            setTimeout(() => {
                setIsLoading(false);
                // Return a mock transcription of the current question text
                const mockTranscription = test.content[currentQuestionIndex].question_text;
                resolve(mockTranscription);
            }, 1500);
        });
    };

    const abandonTest = async (userId) => {
        if (!userId) return;
        try {
            await testService.abandonTest(userId);
            setTest(null);
            setResult(null);
        } catch (error) {
            console.error("Failed to abandon test:", error);
        }
    };

    return {
        test,
        currentQuestionIndex,
        currentQuestion: (test && test.content) ? test.content[currentQuestionIndex] : null,
        totalQuestions: (test && test.content) ? test.content.length : 0,
        answers,
        startTest,
        submitAnswer,
        submitTest,
        abandonTest,
        mockRecordSpeaking,
        isLoading,
        result,
        reset: () => { setTest(null); setResult(null); }
    };
};
