// src/lib/groqApi.js

import { ACODE_SYSTEM_PROMPT } from 'lib/systemPrompt.js'; // System Prompt Import kiya

// TODO: Yahan apni Groq API key daalna
const GROQ_API_KEY = "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";

// Ye array humari AI ki memory/context handle karega
let chatHistory = [
    { role: "system", content: ACODE_SYSTEM_PROMPT } // Pehla message hamesha System Prompt hoga
];

export async function sendToGroq(prompt) {
    if (!GROQ_API_KEY || GROQ_API_KEY === "YAHAN_APNI_GROQ_API_KEY_DAALNA") {
        throw new Error("API Key missing! Pehle src/lib/groqApi.js me apni Groq API key dalo.");
    }

    // User ka naya message history me daalo
    chatHistory.push({ role: "user", content: prompt });

    const url = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", 
                messages: chatHistory // Poori history bhej rahe hain prompt ke sath
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Groq API Request Failed");
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // AI ka response bhi history me save karo taaki usko purani baatein yaad rahein
        chatHistory.push({ role: "assistant", content: aiResponse });

        return aiResponse;
        
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}
