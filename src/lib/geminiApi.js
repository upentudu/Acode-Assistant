// src/lib/geminiApi.js

// TODO: Yahan apni asli Gemini API key daalna
const GEMINI_API_KEY = "AIzaSyBUHp0LQd1BWURh-f0JDFkHZSpbVckWw3s";

export async function sendToGemini(prompt) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "YAHAN_APNI_API_KEY_DAALNA") {
        throw new Error("API Key missing! Pehle src/lib/geminiApi.js me apni Gemini API key dalo.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "API Request Failed");
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
