const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const generateAIResponse = async (message, studentContext) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API key is not configured");
    }

    if (!message || !message.trim()) {
        throw new Error("Message is required");
    }

    const prompt = `
You are Campus360 AI Assistant, a helpful college campus assistant.

Use the student data below to answer questions about their academics.

Rules:
- Use the provided data for personal academic questions.
- Never invent attendance, assignment, grade, or timetable information.
- If information is unavailable, clearly say so.
- Answer general educational questions normally.
- Keep answers clear and concise.

STUDENT DATA:
${JSON.stringify(studentContext || {}, null, 2)}

STUDENT QUESTION:
${message.trim()}
`;

    // Try the preferred model first, then fallback models.
    const models = [
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite"
    ];

    let lastError;

    for (const model of models) {
        try {
            console.log(`Trying Gemini model: ${model}`);

            const response = await ai.models.generateContent({
                model,
                contents: prompt
            });

            if (!response.text) {
                throw new Error("Gemini returned an empty response");
            }

            console.log(`Gemini response generated using ${model}`);

            return response.text;

        } catch (error) {
            lastError = error;

            const status =
                error.status ||
                error.code ||
                error.error?.code;

            console.error(
                `Gemini model ${model} failed:`,
                status || error.message
            );

            // Only fallback for temporary service or rate-limit errors.
            const retryableStatuses = [408, 429, 500, 502, 503, 504];

            if (!retryableStatuses.includes(Number(status))) {
                throw error;
            }
        }
    }

    throw lastError || new Error("All Gemini models failed");
};

module.exports = {
    generateAIResponse
};