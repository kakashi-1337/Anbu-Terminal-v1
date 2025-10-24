import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AiSettings, TerminalLine } from '../types';
import { executeCommand, sendMessage } from '../services/geminiService';
import { Content } from '@google/genai';

const TerminalHeader: React.FC<{ onOpenSettings: () => void }> = ({ onOpenSettings }) => (
  <div className="flex items-center h-8 px-3 bg-black/90 rounded-t-lg" style={{ borderBottom: '1px solid var(--color-border)'}}>
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
    </div>
    <div className="flex-grow text-center text-sm" style={{ color: 'var(--color-header-text)'}}>kali-gpt@terminal</div>
    <button onClick={onOpenSettings} className="text-gray-400 hover:text-white transition-colors" aria-label="Open settings">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8.21 5.15a1.5 1.5 0 00-2.09 2.09l-1.98 1.25c-1.56.38-1.56 2.6 0 2.98l1.98 1.25a1.5 1.5 0 002.09 2.09l.3 1.98c.38 1.56 2.6 1.56 2.98 0l.3-1.98a1.5 1.5 0 002.09-2.09l1.98-1.25c-1.56-.38-1.56-2.6 0-2.98l-1.98-1.25a1.5 1.5 0 00-2.09-2.09l-.3-1.98zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
    </button>
  </div>
);

const BlinkingCursor: React.FC = () => (
    <span className="inline-block w-2 h-4 bg-gray-200 animate-pulse ml-1" style={{ animationDuration: '1s' }}></span>
);

const TerminalOutput: React.FC<{ lines: TerminalLine[]; isLoading: boolean }> = ({ lines, isLoading }) => (
    <>
        {lines.map((line, index) => (
            <div key={line.id} className="whitespace-pre-wrap break-words">
                {line.type === 'command' && (
                    <div className="flex items-center">
                        <span style={{ color: 'var(--color-prompt)' }}>user@kali-gpt:~$</span>
                        <span className="ml-2 text-gray-200">{line.text}</span>
                    </div>
                )}
                {line.type === 'output' && (
                    <div>
                        <span className="text-gray-200">{line.text}</span>
                        {isLoading && index === lines.length - 1 && <BlinkingCursor />}
                    </div>
                )}
                {line.type === 'system' && <p className="text-yellow-400">{line.text}</p>}
            </div>
        ))}
    </>
);

const neofetch = `      *
     ***
    *****      kali-gpt@terminal
***********    -----------------
    *****      OS: Kali Linux (AI Emulation)
     ***       Model: gemini-2.5-flash
      *        Status: Ready

Welcome to your AI Terminal.
Type 'help' to see example commands.
Type 'chat -m "your message"' to start a conversation.`;

const Terminal: React.FC<{ onOpenSettings: () => void; aiSettings: AiSettings }> = ({ onOpenSettings, aiSettings }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: 'system', text: neofetch },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chatHistory, setChatHistory] = useState<Content[]>([]);

  const endOfLinesRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    endOfLinesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCommand = useCallback(async (command: string) => {
    const commandTrimmed = command.trim();
    if (!commandTrimmed) return;

    setLines((prev) => [
      ...prev,
      { id: Date.now(), type: 'command', text: command },
    ]);
    if (command !== history[0]) {
        setHistory(prev => [command, ...prev]);
    }
    setHistoryIndex(-1);

    // Handle non-streaming client-side commands first
    if (commandTrimmed.toLowerCase() === 'clear') {
        setLines([{ id: 0, type: 'system', text: neofetch }]);
        return;
    }
    if (commandTrimmed.toLowerCase() === 'chat --reset') {
        setChatHistory([]);
        setLines(prev => [...prev, {id: Date.now() + 1, type: 'system', text: "Chat session history has been reset."}]);
        return;
    }

    const chatMessageMatch = commandTrimmed.match(/^chat\s+-m\s+"([^"]+)"$/);
    
    setIsLoading(true);

    const responseLineId = Date.now() + 1;
    setLines(prev => [...prev, { id: responseLineId, type: 'output', text: '' }]);

    const onChunk = (chunk: string) => {
        setLines(prev => prev.map(line => 
            line.id === responseLineId 
                ? { ...line, text: line.text + chunk } 
                : line
        ));
        scrollToBottom();
    };

    try {
      if (chatMessageMatch) {
        const message = chatMessageMatch[1];
        const { newHistory } = await sendMessage(message, chatHistory, aiSettings, onChunk);
        setChatHistory(newHistory);
      } else {
        await executeCommand(command, aiSettings, onChunk);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setLines(prev => prev.map(line => 
          line.id === responseLineId 
              ? { ...line, text: `Error: ${errorMessage}` } 
              : line
      ));
    } finally {
      setIsLoading(false);
    }
  }, [chatHistory, history, aiSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if(history.length > 0 && historyIndex < history.length -1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if(historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setInput(history[newIndex]);
        } else {
            setHistoryIndex(-1);
            setInput('');
        }
    }
  };
  
  const prompt = 'user@kali-gpt:~$';

  return (
    <div 
      className="w-full max-w-5xl h-[90vh] lg:h-[80vh] bg-black/75 backdrop-blur-lg rounded-lg flex flex-col overflow-hidden"
      style={{
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--color-shadow)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <TerminalHeader onOpenSettings={onOpenSettings} />
      <div className="flex-grow p-4 overflow-y-auto text-sm lg:text-base">
        <TerminalOutput lines={lines} isLoading={isLoading} />
        <div ref={endOfLinesRef} />
      </div>
      <div className="flex items-center p-2 bg-black/75" style={{ borderTop: '1px solid var(--color-border)'}}>
        <span style={{ color: 'var(--color-prompt)' }}>{prompt}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow ml-2 bg-transparent text-gray-200 outline-none"
          disabled={isLoading}
          autoFocus
          spellCheck="false"
          autoComplete="off"
        />
      </div>
    </div>
  );
};

export default Terminal;