# Kali-GPT: The AI Transparent Terminal

A sleek, cross-platform, and highly customizable terminal interface powered by a dual AI core. Simulate shell commands, chat with your AI, and tune its personality—all within a stunning cyberpunk aesthetic. No subscriptions, just pure, open-source power.

![Kali-GPT Screenshot](https://i.imgur.com/gY8g2Ab.png)
*^ A real screenshot of the terminal in action!*

---

## ✨ Features

*   **Dual AI Core:** Seamlessly switch between the power of Google Gemini (cloud) and the privacy of a local Ollama instance right from the settings.
*   **AI-Powered Command Simulation:** The AI realistically simulates a Kali Linux terminal, providing intelligent outputs for commands.
*   **Conversational Chat:** Engage in natural, context-aware conversations with your AI companion, Kali-GPT.
*   **Deep Customization:**
    *   **Themes:** Choose from multiple cyberpunk-inspired themes (Red Cyberpunk, Neon Blade, Matrix Glitch) or use your own background image.
    *   **Fonts:** Select from a curated list of classic monospace terminal fonts.
    *   **Tune the AI's Personality:** Edit the system prompts directly in the settings to control how the AI behaves for both commands and chat. Make it your own!
*   **Cross-Platform:** Runs on any modern web browser on **Windows, macOS, and Linux**.
*   **100% Open Source & Free:** This project is for the community. It's free to use, modify, and share forever. No payments, no catch.

## 🚀 Getting Started

You can run this project in any environment that supports a modern web server.

### 1. Get the Code

Download all the project files and arrange them in the following folder structure:

```
ai-terminal/
├── components/
│   ├── Settings.tsx
│   └── Terminal.tsx
├── services/
│   ├── geminiService.ts
│   └── prompts.ts
├── App.tsx
├── index.html
├── index.tsx
├── metadata.json
├── themes.ts
├── types.ts
├── LICENSE
└── README.md
```

### 2. Set Your API Key (for Gemini)

This application requires a Google Gemini API key to function with the Gemini provider.

1.  Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  The application is designed to use an environment variable `process.env.API_KEY`. If you are deploying this to a platform like Vercel, Netlify, or running it in an online IDE like Glitch or Replit, set your API key in the project's "Secrets" or "Environment Variables" section. The code will pick it up automatically.

### 3. Run the Terminal

The simplest way to run this locally is with `npx serve`.

1.  Open your system's terminal (like PowerShell, Command Prompt, or bash).
2.  Navigate to the `ai-terminal` directory you created.
3.  Run the command:
    ```bash
    npx serve
    ```
4.  Open your web browser and go to the local address it provides (usually `http://localhost:3000`).

## 🖥️ Using the Ollama (Local AI) Provider

For complete privacy and offline use, you can run the AI locally using Ollama.

1.  **Install Ollama:** Follow the instructions on the [Ollama website](https://ollama.com/).
2.  **Download a Model:** From your system's terminal, pull a model. `llama3` is a great choice.
    ```bash
    ollama run llama3
    ```
3.  **Configure in Settings:** In the Kali-GPT terminal, open Settings, switch the AI Provider to "Ollama", and ensure the Base URL and Model name are correct.

## 🤝 Contributing

This is an open-source project built for the community. Contributions are welcome! Feel free to fork the repository, make improvements, and submit a pull request.

---

Built with ❤️ for the open-source community.