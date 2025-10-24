export interface TerminalLine {
  id: number;
  type: 'command' | 'output' | 'system';
  text: string;
}

export type AiProvider = 'gemini' | 'ollama';

export interface AiSettings {
  provider: AiProvider;
  gemini: {
    model: string;
    commandSystemInstruction?: string;
    chatSystemInstruction?: string;
  };
  ollama: {
    baseUrl: string;
    model: string;
    commandSystemInstruction?: string;
    chatSystemInstruction?: string;
  };
}