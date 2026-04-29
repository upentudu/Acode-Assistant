// src/lib/groqApi.js

import { ACODE_SYSTEM_PROMPT } from './systemPrompt.js';
import fsOperation from 'fileSystem';

const GROQ_API_KEY = "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";

let chatHistory = [
    { role: "system", content: ACODE_SYSTEM_PROMPT }
];

const tools = [
    {
        type: "function",
        function: {
            name: "list_dir",
            description: "Lists all files and folders inside a directory. Use this to explore the project structure.",
            parameters: {
                type: "object",
                properties: { dir_path: { type: "string" } },
                required: ["dir_path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Reads the complete content of a file.",
            parameters: {
                type: "object",
                properties: { file_path: { type: "string" } },
                required: ["file_path"]
            }
        }
    }
];

async function callGroqAPI() {
    const url = "https://api.groq.com/openai/v1/chat/completions";
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: chatHistory,
            tools: tools,
            tool_choice: "auto"
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Groq API Request Failed");
    }

    const data = await response.json();
    const responseMessage = data.choices[0].message;

    if (responseMessage.tool_calls) {
        
        // FIX: Groq Object-to-String Bug
        responseMessage.tool_calls.forEach(tool => {
            if (tool.function && typeof tool.function.arguments === 'object') {
                tool.function.arguments = JSON.stringify(tool.function.arguments);
            }
        });

        chatHistory.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
            let toolResult = "";
            try {
                const args = JSON.parse(toolCall.function.arguments);

                if (toolCall.function.name === "list_dir") {
                    const fs = fsOperation(args.dir_path);
                    if (await fs.exists()) {
                        const list = await fs.lsDir();
                        toolResult = list.map(item => `[${item.isDirectory ? 'DIR' : 'FILE'}] ${item.name} -> ${item.url}`).join('\n');
                    } else {
                        toolResult = `Error: Directory not found at ${args.dir_path}`;
                    }
                } 
                else if (toolCall.function.name === "read_file") {
                    const fs = fsOperation(args.file_path);
                    if (await fs.exists()) {
                        toolResult = await fs.readFile('utf-8');
                    } else {
                        toolResult = `Error: File not found at ${args.file_path}`;
                    }
                }
            } catch (err) {
                toolResult = `Error: ${err.message}`;
            }

            chatHistory.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: toolCall.function.name,
                content: toolResult || "Success"
            });
        }

        return await callGroqAPI();
    }

    chatHistory.push({ role: "assistant", content: responseMessage.content });
    return responseMessage.content;
}

export async function sendToGroq(prompt) {
    if (!GROQ_API_KEY) throw new Error("API Key missing!");

    // 🧠 SMART CONTEXT INJECTION (Tumhara Idea!)
    let currentWorkspace = "No folder currently opened.";
    try {
        // Acode ka internal module use karke opened folders nikalo
        const addedFolders = window.acode.require('addedfolder');
        if (addedFolders && addedFolders.length > 0) {
            // Jo folder Acode ki sidebar me khula hai, uska exact URL le lo
            currentWorkspace = addedFolders[0].url; 
        }
    } catch (e) {
        console.warn("Could not fetch Acode workspace context.");
    }

    // User ke prompt ke aage chupke se system context laga do
    const contextualPrompt = `[System Context: The user's Current Working Directory URL is: '${currentWorkspace}']\n\nUser Message: ${prompt}`;

    // Ab AI ko exactly pata hoga ki use list_dir() me kya path dalni hai!
    chatHistory.push({ role: "user", content: contextualPrompt });
    
    try {
        return await callGroqAPI();
    } catch (error) {
        chatHistory.pop(); // Error aane par prompt hata do
        throw error;
    }
}
