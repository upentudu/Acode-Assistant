// src/lib/groqApi.js

// TODO: Yahan apni Groq API key daalna
const GROQ_API_KEY = "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";

export async function sendToGroq(prompt) {
    if (!GROQ_API_KEY || GROQ_API_KEY === "YAHAN_APNI_GROQ_API_KEY_DAALNA") {
        throw new Error("API Key missing! Pehle src/lib/groqApi.js me apni Groq API key dalo.");
    }

    const url = "https://api.groq.com/openai/v1/chat/completions";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                // Naya, advanced aur supported model
                model: "llama-3.3-70b-versatile", 
                messages: [{
                    role: "user",
                    content: prompt
                }]
            })

        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "Groq API Request Failed");
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
    } catch (error) {
        console.error("Groq API Error:", error);
        throw error;
    }
}
