import React from 'react';
import { themes, fonts } from '../themes';
import { AiSettings } from '../types';

interface SettingsProps {
  currentSettings: {
    themeName: string;
    fontFamily: string;
    bgImageUrl: string;
    ai: AiSettings;
  };
  onSettingsChange: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ currentSettings, onSettingsChange, onClose }) => {
  const { ai } = currentSettings;
  const currentProviderSettings = ai[ai.provider];

  const handleAiChange = (field: string, value: any) => {
    onSettingsChange((s: any) => ({
      ...s,
      ai: {
        ...s.ai,
        [s.ai.provider]: {
          ...s.ai[s.ai.provider],
          [field]: value,
        },
      },
    }));
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-gray-900/90 border rounded-lg shadow-2xl p-6 text-gray-200 overflow-y-auto max-h-[90vh]"
        style={{ borderColor: 'var(--color-border)', boxShadow: 'var(--color-shadow)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-header-text)'}}>Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        {/* --- UI Settings --- */}
        <div className="mb-4 border-b pb-4" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-header-text)' }}>Appearance</h3>
            {/* Theme Selector */}
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(themes).map(themeKey => (
                  <button
                    key={themeKey}
                    onClick={() => onSettingsChange((s: any) => ({ ...s, themeName: themeKey }))}
                    className={`p-2 rounded border-2 transition-colors text-sm ${currentSettings.themeName === themeKey ? '' : 'border-gray-600 hover:border-gray-400'}`}
                    style={{ borderColor: currentSettings.themeName === themeKey ? 'var(--color-primary)' : undefined }}
                  >
                    {themes[themeKey].name}
                  </button>
                ))}
              </div>
            </div>
            {/* Font Selector */}
            <div className="mb-4">
                <label htmlFor="font-select" className="block mb-2 text-sm font-medium">Font</label>
                <select
                    id="font-select"
                    value={currentSettings.fontFamily}
                    onChange={e => onSettingsChange((s: any) => ({ ...s, fontFamily: e.target.value }))}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                >
                    {Object.keys(fonts).map(fontName => (
                        <option key={fontName} value={fontName}>{fontName}</option>
                    ))}
                </select>
            </div>
            {/* BG Image URL */}
            <div>
                <label htmlFor="bg-url-input" className="block mb-2 text-sm font-medium">Custom Background URL</label>
                <input
                    type="text"
                    id="bg-url-input"
                    placeholder="Leave empty for default theme background"
                    value={currentSettings.bgImageUrl}
                    onChange={e => onSettingsChange((s: any) => ({ ...s, bgImageUrl: e.target.value }))}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                />
            </div>
        </div>

        {/* --- AI Core Settings --- */}
        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-header-text)' }}>AI Core</h3>
            <div className="mb-4">
                <label htmlFor="ai-provider" className="block mb-2 text-sm font-medium">AI Provider</label>
                <select
                    id="ai-provider"
                    value={ai.provider}
                    onChange={e => onSettingsChange(s => ({ ...s, ai: { ...s.ai, provider: e.target.value }}))}
                    className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                >
                    <option value="gemini">Google Gemini</option>
                    <option value="ollama">Ollama (Local)</option>
                </select>
            </div>

            {/* Provider-Specific Settings */}
            <div className='space-y-4'>
                {ai.provider === 'ollama' && (
                    <div>
                        <label htmlFor="ollama-url" className="block mb-2 text-sm font-medium">Ollama Base URL</label>
                        <input
                            type="text"
                            id="ollama-url"
                            value={ai.ollama.baseUrl}
                            onChange={e => handleAiChange('baseUrl', e.target.value)}
                            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                        />
                    </div>
                )}
                 <div>
                    <label htmlFor="model" className="block mb-2 text-sm font-medium text-capitalize">{ai.provider} Model</label>
                    <input
                        type="text"
                        id="model"
                        value={currentProviderSettings.model}
                        onChange={e => handleAiChange('model', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                    />
                </div>
                <div>
                    <label htmlFor="command-prompt" className="block mb-2 text-sm font-medium">Command System Prompt</label>
                    <textarea
                        id="command-prompt"
                        rows={4}
                        value={currentProviderSettings.commandSystemInstruction}
                        onChange={e => handleAiChange('commandSystemInstruction', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                    />
                </div>
                 <div>
                    <label htmlFor="chat-prompt" className="block mb-2 text-sm font-medium">Chat System Prompt</label>
                    <textarea
                        id="chat-prompt"
                        rows={4}
                        value={currentProviderSettings.chatSystemInstruction}
                        onChange={e => handleAiChange('chatSystemInstruction', e.target.value)}
                        className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full p-2.5"
                    />
                </div>
            </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 rounded text-white font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Settings;