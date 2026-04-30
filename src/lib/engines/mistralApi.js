// src/lib/engines/mistralApi.js

import { ACODE_SYSTEM_PROMPT } from '../systemPrompt.js';
import fsOperation from 'fileSystem';

// Hardcoded key hata di hai, UI se aayegi
const getNvidiaKey = () => localStorage.getItem('ACODE_NVIDIA_API_KEY');

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
    },
    {
        type: "function",
        function: {
            name: "write_file",
            description: "Creates a new file or overwrites an existing one with new content. Provide the complete code/content.",
            parameters: {
                type: "object",
                properties: { 
                    file_path: { type: "string" },
                    content: { type: "string" }
                },
                required: ["file_path", "content"]
            }
            
        }
    },
    {
        type: "function",
        function: {
            name: "edit_file",
            description: "Edits an existing file by replacing specific lines of code. Use this for precise modifications instead of rewriting the entire file.",
            parameters: {
                type: "object",
                properties: { 
                    file_path: { type: "string", description: "The exact URL or path to the file." },
                    start_line: { type: "number", description: "The 1-based starting line number to replace." },
                    end_line: { type: "number", description: "The 1-based ending line number to replace (inclusive)." },
                    new_code: { type: "string", description: "The new code snippet to insert in place of the replaced lines." }
                },
                required: ["file_path", "start_line", "end_line", "new_code"]
            }
        }
    }
];

async function callNvidiaAPI(onProgress) {
    const API_KEY = getNvidiaKey();
    if (!API_KEY) throw new Error("Nvidia API Key missing. Please set it in Settings ⚙️");

    const url = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
            "Accept": "text/event-stream"
        },
        body: JSON.stringify({
            model: "mistralai/mistral-medium-3.5-128b", // 🔥 SIRF YE LINE CHANGE KANI HAI BAAKI FILES ME 🔥
            messages: chatHistory,
            tools: tools,
            tool_choice: "auto",
            stream: true,
            max_tokens: 16384,
            temperature: 0.70
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Nvidia API Request Failed");
    }

    // 🌊 STREAM PARSING LOGIC 🌊
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    
    let fullAiMessage = "";
    let toolCallsBuffer = [];

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));

        for (const line of lines) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') continue;

            try {
                const data = JSON.parse(dataStr);
                const delta = data.choices[0]?.delta;
                
                if (!delta) continue;

                // 1. Agar normal text aa raha hai, toh UI ko bhejo
                if (delta.content) {
                    fullAiMessage += delta.content;
                    if (onProgress) onProgress(fullAiMessage); // Update UI real-time!
                }

                // 2. Agar Tool Call aa raha hai, toh use Buffer me save karo
                if (delta.tool_calls) {
                    for (const tcDelta of delta.tool_calls) {
                        const idx = tcDelta.index;
                        if (!toolCallsBuffer[idx]) {
                            toolCallsBuffer[idx] = {
                                id: tcDelta.id,
                                type: "function",
                                function: { name: tcDelta.function?.name || "", arguments: "" }
                            };
                        }
                        if (tcDelta.function?.arguments) {
                            toolCallsBuffer[idx].function.arguments += tcDelta.function.arguments;
                        }
                    }
                }
            } catch (e) {
                console.error("Stream parse error:", e);
            }
        }
    }

    // 🛠️ STREAM KHATAM HONE KE BAAD TOOL EXECUTION 🛠️
    toolCallsBuffer = toolCallsBuffer.filter(Boolean); // Clean empty slots

    if (toolCallsBuffer.length > 0) {
        // AI ki request history me save karo
        chatHistory.push({
            role: "assistant",
            content: fullAiMessage || null,
            tool_calls: toolCallsBuffer
        });

        // Har tool ko execute karo
        for (const toolCall of toolCallsBuffer) {
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
                else if (toolCall.function.name === "write_file") {
                    const dirPath = args.file_path.substring(0, args.file_path.lastIndexOf('/'));
                    const fileName = args.file_path.substring(args.file_path.lastIndexOf('/') + 1);
                    
                    const fileFs = fsOperation(args.file_path);
                    const parentFs = fsOperation(dirPath);

                    if (await fileFs.exists()) {
                        await fileFs.writeFile(args.content);
                        toolResult = `Success: Existing file overwritten at ${args.file_path}`;
                    } else {
                        if (await parentFs.exists()) {
                            await parentFs.createFile(fileName, args.content);
                            toolResult = `Success: New file created at ${args.file_path}`;
                        } else {
                            toolResult = `Error: Parent directory does not exist at ${dirPath}`;
                        }
                    }
                }
                // 🔥 NAYA LOGIC: Precise Code Editing 🔥
                else if (toolCall.function.name === "edit_file") {
                    const fs = fsOperation(args.file_path);
                    
                    if (await fs.exists()) {
                        const fileContent = await fs.readFile('utf-8');
                        const lines = fileContent.split('\n'); // File ko lines me todo
                        
                        // 1-based indexing ko JS ki 0-based array indexing me badlo
                        const startIdx = Math.max(0, args.start_line - 1);
                        const deleteCount = Math.max(1, args.end_line - args.start_line + 1);
                        
                        // Array splice se purani lines hatao aur naya code dalo
                        lines.splice(startIdx, deleteCount, args.new_code);
                        
                        // Wapas string banakar file me save kar do
                        await fs.writeFile(lines.join('\n'));
                        toolResult = `Success: Lines ${args.start_line} to ${args.end_line} replaced successfully in ${args.file_path}`;
                    } else {
                        toolResult = `Error: File not found at ${args.file_path}. Cannot edit.`;
                    }
                }
            } catch (err) {
                toolResult = `Error: ${err.message}`;
            }

            // Tool ka result history me dalo
            chatHistory.push({
                tool_call_id: toolCall.id,
                role: "tool",
                name: toolCall.function.name,
                content: toolResult || "Success"
            });
        }

        // Loop: Tool ka result lekar naya message generate karo
        return await callNvidiaAPI(onProgress); // ✅ FIXED
    }

    // Agar koi tool call nahi hua (yaani normal reply khatam ho gaya)
    chatHistory.push({ role: "assistant", content: fullAiMessage });
    return fullAiMessage;
}


export async function sendToMistral(prompt, onProgress) {
    let currentWorkspace = "No folder currently opened.";
    try {
        const addedFolders = window.acode.require('addedfolder');
        if (addedFolders && addedFolders.length > 0) currentWorkspace = addedFolders[0].url;
    } catch (e) {
        console.warn("Could not fetch Acode workspace context.");
    }

    const contextualPrompt = `[System Context: The user's Current Working Directory URL is: '${currentWorkspace}']\n\nUser Message: ${prompt}`;
    chatHistory.push({ role: "user", content: contextualPrompt });
    
    try {
        return await callNvidiaAPI(onProgress);
    } catch (error) {
        chatHistory.pop(); 
        throw error;
    }
}
