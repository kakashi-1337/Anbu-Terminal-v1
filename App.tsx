import React, { useState, useEffect } from 'react';
import Terminal from './components/Terminal';
import Settings from './components/Settings';
import { themes, fonts } from './themes';
import { AiSettings } from './types';
import { DEFAULT_COMMAND_PROMPT, DEFAULT_CHAT_PROMPT } from './services/prompts';

// Helper to safely get settings from localStorage
const getInitialSettings = () => {
    try {
        const item = window.localStorage.getItem('terminal-settings');
        return item ? JSON.parse(item) : {};
    } catch (error) {
        console.warn("Could not parse settings from localStorage", error);
        return {};
    }
};

const App: React.FC = () => {
    const [settings, setSettings] = useState(() => {
        const saved = getInitialSettings();
        const aiDefaults = {
            provider: 'gemini',
            gemini: { 
                model: 'gemini-2.5-flash',
                commandSystemInstruction: DEFAULT_COMMAND_PROMPT,
                chatSystemInstruction: DEFAULT_CHAT_PROMPT,
            },
            ollama: { 
                baseUrl: 'http://localhost:11434', 
                model: 'llama3',
                commandSystemInstruction: DEFAULT_COMMAND_PROMPT,
                chatSystemInstruction: DEFAULT_CHAT_PROMPT,
            }
        };

        return {
            themeName: saved.themeName || 'red-cyberpunk',
            fontFamily: saved.fontFamily || 'Fira Code',
            bgImageUrl: saved.bgImageUrl || '',
            ai: {
                ...aiDefaults,
                ...(saved.ai || {}),
                gemini: { ...aiDefaults.gemini, ...(saved.ai?.gemini || {}) },
                ollama: { ...aiDefaults.ollama, ...(saved.ai?.ollama || {}) },
            } as AiSettings,
        };
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Effect to save settings to localStorage whenever they change
    useEffect(() => {
        try {
            window.localStorage.setItem('terminal-settings', JSON.stringify(settings));
        } catch (error) {
            console.error("Could not save settings to localStorage", error);
        }
    }, [settings]);

    // Effect to apply theme, font, and background styles to the document
    useEffect(() => {
        const currentTheme = themes[settings.themeName] || themes['red-cyberpunk'];
        const root = document.documentElement;

        // Set CSS variables for colors, enabling theme-aware components
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
            const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });
        
        // Set body background and font
        document.body.style.backgroundImage = `url('${settings.bgImageUrl || currentTheme.defaultBg}')`;
        document.body.style.fontFamily = fonts[settings.fontFamily as keyof typeof fonts] || fonts['Fira Code'];
        
        // Update scrollbar styles dynamically via an injected style tag
        const styleId = 'dynamic-theme-styles';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
            ::-webkit-scrollbar-thumb {
                background: ${currentTheme.colors.scrollbarThumb};
                border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: ${currentTheme.colors.scrollbarThumbHover};
            }
        `;

    }, [settings]);


    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 font-mono text-white">
            <Terminal onOpenSettings={() => setIsSettingsOpen(true)} aiSettings={settings.ai} />
            {isSettingsOpen && (
                <Settings
                    currentSettings={settings}
                    onSettingsChange={setSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}
        </div>
    );
};

export default App;