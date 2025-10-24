import { GoogleGenAI, Content } from "@google/genai";
import { AiSettings } from "../types";
import { DEFAULT_COMMAND_PROMPT, DEFAULT_CHAT_PROMPT } from "./prompts";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("Gemini API key is not configured. The Gemini provider will not work.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });


// --- Gemini Streaming Implementations ---

const executeGeminiCommandStream = async (command: string, settings: AiSettings['gemini'], onChunk: (chunk: string) => void): Promise<void> => {
  if (!API_KEY) {
    onChunk("Error: Gemini API key is not configured.");
    return;
  }
  const responseStream = await ai.models.generateContentStream({
    model: settings.model,
    contents: command,
    config: {
      systemInstruction: settings.commandSystemInstruction || DEFAULT_COMMAND_PROMPT,
      temperature: 0.1,
    },
  });
  for await (const chunk of responseStream) {
    onChunk(chunk.text);
  }
};

const sendGeminiMessageStream = async (message: string, history: Content[], settings: AiSettings['gemini'], onChunk: (chunk: string) => void): Promise<{ newHistory: Content[] }> => {
    if (!API_KEY) throw new Error("Gemini API key is not configured.");
    const chat = ai.chats.create({
        model: settings.model,
        history: history,
        config: { 
            systemInstruction: settings.chatSystemInstruction || DEFAULT_CHAT_PROMPT, 
            temperature: 0.7 
        }
    });
    const resultStream = await chat.sendMessageStream({ message });
    for await (const chunk of resultStream) {
        onChunk(chunk.text);
    }
    const newHistory = await chat.getHistory();
    return { newHistory };
};


// --- Ollama Streaming Implementations ---

async function readStream(reader: ReadableStreamDefaultReader<Uint8Array>, onChunk: (json: any) => void) {
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last, possibly incomplete line
        for (const line of lines) {
            if (line.trim() === '') continue;
            try {
                onChunk(JSON.parse(line));
            } catch (e) {
                console.error("Failed to parse Ollama stream chunk:", line);
            }
        }
    }
}

const executeOllamaCommandStream = async (command: string, settings: AiSettings['ollama'], onChunk: (chunk: string) => void): Promise<void> => {
    const response = await fetch(`${settings.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: settings.model,
            prompt: command,
            system: settings.commandSystemInstruction || DEFAULT_COMMAND_PROMPT,
            stream: true,
            options: { temperature: 0.1 }
        })
    });
    if (!response.ok || !response.body) throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    
    await readStream(response.body.getReader(), (json) => {
        if (json.response) onChunk(json.response);
    });
};

const sendOllamaMessageStream = async (message: string, history: Content[], settings: AiSettings['ollama'], onChunk: (chunk: string) => void): Promise<{ newHistory: Content[] }> => {
    const ollamaMessages = history
        .filter(h => h.parts.every(p => 'text' in p))
        .map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts.map(p => (p as {text: string}).text).join(' '),
        }));
    ollamaMessages.push({ role: 'user', content: message });

    const response = await fetch(`${settings.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: settings.model,
            messages: ollamaMessages,
            system: settings.chatSystemInstruction || DEFAULT_CHAT_PROMPT,
            stream: true,
            options: { temperature: 0.7 }
        })
    });
    if (!response.ok || !response.body) throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    
    let fullResponse = "";
    await readStream(response.body.getReader(), (json) => {
        if (json.message?.content) {
            const content = json.message.content;
            onChunk(content);
            fullResponse += content;
        }
    });

    const newHistory: Content[] = [
        ...history,
        { role: 'user', parts: [{ text: message }] },
        { role: 'model', parts: [{ text: fullResponse }] }
    ];
    return { newHistory };
};


// --- Public API ---

export const executeCommand = async (command: string, aiSettings: AiSettings, onChunk: (chunk: string) => void): Promise<void> => {
  try {
    if (aiSettings.provider === 'ollama') {
      await executeOllamaCommandStream(command, aiSettings.ollama, onChunk);
    } else {
      await executeGeminiCommandStream(command, aiSettings.gemini, onChunk);
    }
  } catch (error) {
    console.error("Error executing command:", error);
    const message = error instanceof Error ? `API Error: ${error.message}` : "An unexpected error occurred while communicating with the AI.";
    onChunk(message);
  }
};

export const sendMessage = async (message: string, history: Content[], aiSettings: AiSettings, onChunk: (chunk: string) => void): Promise<{ newHistory: Content[] }> => {
    try {
        if (aiSettings.provider === 'ollama') {
            return await sendOllamaMessageStream(message, history, aiSettings.ollama, onChunk);
        }
        return await sendGeminiMessageStream(message, history, aiSettings.gemini, onChunk);
    } catch(error) {
        console.error("Error sending message:", error);
        const errorMsg = error instanceof Error ? `API Error: ${error.message}` : "An unexpected error occurred while communicating with the AI.";
        onChunk(errorMsg);
        // Return the old history so the app state doesn't break
        return { newHistory: history };
    }
};