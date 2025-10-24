export interface Theme {
  name: string;
  colors: {
    primary: string;
    headerText: string;
    border: string;
    shadow: string;
    prompt: string;
    scrollbarThumb: string;
    scrollbarThumbHover: string;
  };
  defaultBg: string;
}

export const themes: Record<string, Theme> = {
  'red-cyberpunk': {
    name: 'Red Cyberpunk',
    colors: {
      primary: '#ef4444', // red-500
      headerText: '#f87171', // red-400
      border: 'rgba(239, 68, 68, 0.5)', // red-500/50
      shadow: '0 0 1.5rem rgba(239, 68, 68, 0.2)', // shadow-red-500/20
      prompt: '#ef4444', // red-500
      scrollbarThumb: '#991b1b', // red-800
      scrollbarThumbHover: '#b91c1c', // red-700
    },
    defaultBg: 'https://images.unsplash.com/photo-1618022039368-b35ef26462b8?q=80&w=2070&auto=format&fit=crop',
  },
  'neon-blade': {
    name: 'Neon Blade',
    colors: {
      primary: '#3b82f6', // blue-500
      headerText: '#60a5fa', // blue-400
      border: 'rgba(59, 130, 246, 0.5)', // blue-500/50
      shadow: '0 0 1.5rem rgba(59, 130, 246, 0.2)', // shadow-blue-500/20
      prompt: '#3b82f6', // blue-500
      scrollbarThumb: '#1e40af', // blue-800
      scrollbarThumbHover: '#1d4ed8', // blue-700
    },
    defaultBg: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop',
  },
  'matrix-glitch': {
    name: 'Matrix Glitch',
    colors: {
      primary: '#22c55e', // green-500
      headerText: '#4ade80', // green-400
      border: 'rgba(34, 197, 94, 0.5)', // green-500/50
      shadow: '0 0 1.5rem rgba(34, 197, 94, 0.2)', // shadow-green-500/20
      prompt: '#22c55e', // green-500
      scrollbarThumb: '#15803d', // green-800
      scrollbarThumbHover: '#16a34a', // green-700
    },
    defaultBg: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop',
  },
};

export const fonts: Record<string, string> = {
    'Fira Code': '"Fira Code", monospace',
    'Roboto Mono': '"Roboto Mono", monospace',
    'Source Code Pro': '"Source Code Pro", monospace',
    'IBM Plex Mono': '"IBM Plex Mono", monospace'
};