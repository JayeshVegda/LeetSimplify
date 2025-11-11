# LeetSimplify 🚀

<div align="center">

**Transform complex LeetCode problems into beginner-friendly explanations using AI**

[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](https://github.com/JayeshVegda/LeetSimplify/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/chrome-extension-4285F4?logo=google-chrome)](https://chrome.google.com/webstore)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![CI](https://github.com/JayeshVegda/LeetSimplify/actions/workflows/ci.yml/badge.svg)](https://github.com/JayeshVegda/LeetSimplify/actions/workflows/ci.yml)
[![GitHub Pages](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://jayeshvegda.github.io/LeetSimplify/)

*Making coding interview preparation accessible to everyone*

</div>

---

## ✨ Features

- 🤖 **Multiple AI Providers** - Support for Gemini, ChatGPT, Claude, Cohere, Mistral, and **Local LLMs (Ollama)**
- 🎯 **Two Simplification Modes**
  - **No Hint**: Pure problem simplification with all conditions preserved
  - **With Hint**: Includes gentle thinking hints to guide your approach
- 🔒 **Privacy-First** - Use local LLMs (Ollama) for complete privacy - no data leaves your machine
- 📚 **Complete Problem Details** - Preserves ALL conditions, constraints, and edge cases in easy language
- 🎨 **Seamless Integration** - Beautiful UI that blends perfectly with LeetCode's interface
- ⚡ **Fast & Reliable** - Optimized for quick responses with error handling
- 🔄 **Regenerate Support** - Easy regeneration of simplified explanations
- 📖 **Detailed Examples** - Step-by-step dry-run explanations for better understanding

## 🎯 What It Does

LeetSimplify takes complex LeetCode problem descriptions and rewrites them in simple, beginner-friendly language while preserving **every single detail**:

- ✅ All conditions and constraints
- ✅ All edge cases
- ✅ All input/output formats
- ✅ Complete problem requirements
- ✅ Detailed step-by-step examples

Perfect for beginners who want to understand problems clearly before coding!

## 📦 Installation

### Method 1: From Source (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/JayeshVegda/LeetSimplify.git
   cd LeetSimplify
   ```

2. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `LeetSimplify` directory

3. **Verify installation**:
   - The LeetSimplify icon should appear in your toolbar
   - Navigate to any LeetCode problem page
   - You should see a "Simplify" button

### Method 2: Chrome Web Store

*Coming soon!*

## 🚀 Quick Start

### Cloud Providers Setup

1. Click the extension icon in your toolbar
2. Select your preferred provider (Gemini, ChatGPT, Claude, etc.)
3. Enter your API key
4. Choose simplification mode (No Hint / With Hint)
5. Click **"Save Settings"**
6. Navigate to a LeetCode problem and click **"Simplify"**

### Local LLM Setup (Ollama)

**Privacy-friendly option - all processing happens on your machine!**

#### Step 1: Install Ollama

Download from [ollama.com](https://ollama.com) and install.

#### Step 2: Download a Model

```bash
# Recommended: Mistral (good balance of quality and speed)
ollama pull mistral

# Or try other models
ollama pull llama3
ollama pull codellama
ollama pull phi
```

#### Step 3: Configure CORS (Important!)

**Windows:**
```cmd
# Run as Administrator
setx OLLAMA_ORIGINS "chrome-extension://*" /M
```
Then restart Ollama (end process in Task Manager, it will restart automatically).

**macOS/Linux:**
```bash
export OLLAMA_ORIGINS="chrome-extension://*"
# Make it permanent by adding to ~/.bashrc or ~/.zshrc
echo 'export OLLAMA_ORIGINS="chrome-extension://*"' >> ~/.bashrc
source ~/.bashrc
```

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed instructions.

#### Step 4: Configure Extension

1. Open extension settings
2. Select **"Local (Ollama/Self-hosted)"** as provider
3. Set **Endpoint**: `http://127.0.0.1:11434/v1/chat/completions`
   - Or use native API: `http://127.0.0.1:11434/api/generate`
4. Set **Model**: `mistral` (or your downloaded model)
5. API Key: Leave empty or use "local" (not required)
6. Click **"Save Settings"**

#### Step 5: Test

1. Navigate to any LeetCode problem
2. Click the **"Simplify"** button
3. Enjoy your simplified problem description!

## 📖 Usage

1. **Navigate** to any LeetCode problem page (e.g., `https://leetcode.com/problems/two-sum/`)
2. **Click** the **"Simplify"** button (appears near the problem description)
3. **Read** the simplified, beginner-friendly explanation with:
   - Complete problem description in easy language
   - All inputs and outputs explained
   - All rules and constraints listed
   - All edge cases mentioned
   - Detailed step-by-step example with dry-run explanation

### Regenerate

Click the **"↻ Regenerate"** button (inline with mode/provider chips) to get a new simplification.

## 🎨 Features in Detail

### Complete Problem Preservation

Unlike other tools, LeetSimplify ensures **every detail** is preserved:
- All conditions and constraints
- All edge cases
- All input/output formats
- All special requirements
- Complete problem statement

### Detailed Examples

Each simplified problem includes:
- Clear input/output examples
- Step-by-step dry-run explanations
- Explicit counting and calculations
- Constraint verification
- Why the answer is correct

### Two Modes

- **No Hint Mode**: Pure problem simplification - perfect for practice
- **With Hint Mode**: Includes gentle thinking hints - great for learning

## 🔧 Supported Providers

### Cloud Providers
- **Gemini** (Google) - `gemini-2.5-flash` (default)
- **ChatGPT** (OpenAI) - `gpt-4o-mini` (default)
- **Claude** (Anthropic) - `claude-3-5-sonnet-latest` (default)
- **Cohere** - `command-r-plus` (default)
- **Mistral** - `mistral-large-latest` (default)

### Local LLMs (Ollama)
- **Mistral 7B** (Recommended - ~4GB)
- **Llama 3** (~5GB)
- **CodeLlama** (~4-7GB)
- **Phi** (~2GB)
- **Any Ollama model** - Just pull and use!

### Other Local Servers
Works with any OpenAI-compatible API:
- **LM Studio** - `http://localhost:1234/v1/chat/completions`
- **vLLM** - Your vLLM server endpoint
- **Custom servers** - Any OpenAI-compatible endpoint

## 📁 Project Structure

```
LeetSimplify/
├── content.js              # Main content script (LeetCode integration)
├── providers.js            # LLM provider implementations
├── prompts.json            # AI prompts configuration
├── styles.css              # Extension styles
├── manifest.json           # Chrome extension manifest
├── LICENSE                 # MIT License
├── README.md               # This file
├── OLLAMA_SETUP.md         # Detailed Ollama setup guide
├── QUICK_FIX.md            # Quick troubleshooting guide
├── ui/
│   ├── popup.html          # Settings popup HTML
│   ├── popup.js            # Settings popup logic
│   └── popup.css           # Settings popup styles
└── icons/
    ├── icon16.png          # Extension icon (16x16)
    ├── icon48.png          # Extension icon (48x48)
    └── icon128.png         # Extension icon (128x128)
```

## 🛠️ Requirements

### Browser
- Chrome 88+ (or any Chromium-based browser)
- Edge, Brave, Opera, etc. (Chromium-based)

### For Local LLMs (Ollama)
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: 4-10GB for models
- **GPU**: Optional but recommended for faster inference
- **OS**: Windows, macOS, or Linux

## 🔒 Privacy & Security

### Cloud Providers
- Problem descriptions are sent to the selected API provider
- API keys are stored locally in Chrome's sync storage (encrypted)
- No data is collected by the extension itself

### Local LLMs (Ollama)
- **Complete privacy** - All processing happens on your machine
- No data leaves your computer
- No internet connection required (after model download)
- Perfect for sensitive problems or offline use

## 🐛 Troubleshooting

### Local LLM Connection Issues

**Most common issue: CORS blocking**

**Quick Fix:**
1. Set `OLLAMA_ORIGINS=chrome-extension://*` environment variable
2. Restart Ollama service
3. Reload the extension

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed platform-specific instructions.

**Other Issues:**

| Issue | Solution |
|-------|----------|
| "Cannot connect to Ollama" | Check Ollama is running: `curl http://127.0.0.1:11434/api/version` |
| "Model not found" | Verify model is downloaded: `ollama list` |
| "CORS error" | Set `OLLAMA_ORIGINS=chrome-extension://*` and restart Ollama |
| "Empty response" | Model might be loading - wait a few seconds and try again |
| Extension not appearing | Reload extension in `chrome://extensions/` |

### API Key Issues

- **Cloud providers**: Verify your API key is correct and has sufficient credits
- **Local providers**: API key is optional (leave empty or use "local")

### Browser Console

Check browser console (F12) for detailed error messages:
- Look for `[LeetSimplify]` logs
- Check Network tab for failed requests
- Verify extension permissions

### Still Having Issues?

1. Check [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed setup
2. Check [QUICK_FIX.md](QUICK_FIX.md) for quick solutions
3. Open an issue on GitHub with:
   - Browser version
   - Extension version
   - Error messages from console
   - Steps to reproduce

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
5. **Commit your changes**:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Setup

1. Clone the repository
2. Load the extension in Chrome (Developer mode)
3. Make changes to files
4. Reload the extension to test
5. Check browser console for errors

### Code Style

- Use vanilla JavaScript (no frameworks)
- Follow existing code style
- Add comments for complex logic
- Test on actual LeetCode pages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the LeetCode community
- Uses OpenAI-compatible API standards for local LLM support
- Inspired by the need for clearer problem explanations
- Thanks to all AI providers for their APIs

## 📊 Version History

### v1.1.0 (Current)
- ✨ Added local LLM support (Ollama)
- 🎨 Improved regenerate button positioning
- 📝 Enhanced prompts for complete problem preservation
- 🔧 Added automatic fallback to Ollama native API
- 🐛 Improved error handling and CORS support
- 📚 Added detailed dry-run example explanations

### v1.0.1
- 🎯 Added multiple AI provider support
- 🎨 Improved UI and styling
- 🔒 Added context invalidation handling
- 📝 Improved prompts for better accuracy

## 🗺️ Roadmap

- [ ] Support for more local LLM servers
- [ ] Custom prompt templates
- [ ] Problem difficulty analysis
- [ ] Solution hints (optional)
- [ ] Dark/light theme toggle
- [ ] Export simplified problems
- [ ] Browser extension store publication

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/JayeshVegda/LeetSimplify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JayeshVegda/LeetSimplify/discussions)
- **Documentation**: See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) and [QUICK_FIX.md](QUICK_FIX.md)

## ⭐ Star History

If you find this project helpful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ for the LeetCode community**

[Report Bug](https://github.com/JayeshVegda/LeetSimplify/issues) · [Request Feature](https://github.com/JayeshVegda/LeetSimplify/issues) · [Contributing](https://github.com/JayeshVegda/LeetSimplify/blob/main/CONTRIBUTING.md)

</div>
