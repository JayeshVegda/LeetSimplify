# Project Structure

## Overview

LeetSimplify is a Chrome extension that simplifies LeetCode problems using AI. This document describes the project structure.

## Directory Structure

```
LeetSimplify/
├── .github/                          # GitHub templates and workflows
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md            # Bug report template
│       ├── feature_request.md       # Feature request template
│       └── config.yml               # Issue template configuration
│
├── icons/                            # Extension icons
│   ├── icon16.png                   # 16x16 icon
│   ├── icon48.png                   # 48x48 icon
│   └── icon128.png                  # 128x128 icon
│
├── ui/                               # Extension UI files
│   ├── popup.html                   # Settings popup HTML
│   ├── popup.js                     # Settings popup logic
│   └── popup.css                    # Settings popup styles
│
├── content.js                        # Main content script (LeetCode integration)
├── providers.js                      # LLM provider implementations
├── prompts.json                      # AI prompts configuration
├── styles.css                        # Extension styles
├── manifest.json                     # Chrome extension manifest
│
├── README.md                         # Main documentation
├── LICENSE                           # MIT License
├── CONTRIBUTING.md                   # Contribution guidelines
├── CHANGELOG.md                      # Version history
├── SECURITY.md                       # Security policy
├── OLLAMA_SETUP.md                   # Detailed Ollama setup guide
├── QUICK_FIX.md                      # Quick troubleshooting guide
├── PRE_PUBLISH_CHECKLIST.md          # Pre-publish checklist
├── PROJECT_STRUCTURE.md              # This file
└── .gitignore                        # Git ignore rules
```

## File Descriptions

### Core Extension Files

- **manifest.json**: Chrome extension configuration (permissions, content scripts, etc.)
- **content.js**: Main content script that injects UI and handles LeetCode page integration
- **providers.js**: Unified LLM provider interface (Gemini, OpenAI, Anthropic, Cohere, Mistral, Ollama)
- **prompts.json**: AI prompts for problem simplification (No Hint / With Hint modes)
- **styles.css**: Extension UI styles (Simplify button, regenerate button, etc.)

### UI Files

- **ui/popup.html**: Settings popup HTML structure
- **ui/popup.js**: Settings popup logic (save/load configuration, provider selection)
- **ui/popup.css**: Settings popup styles

### Documentation

- **README.md**: Main project documentation (installation, usage, features)
- **CONTRIBUTING.md**: Guidelines for contributors
- **CHANGELOG.md**: Version history and changes
- **SECURITY.md**: Security policy and vulnerability reporting
- **OLLAMA_SETUP.md**: Detailed Ollama setup instructions
- **QUICK_FIX.md**: Quick troubleshooting guide
- **PRE_PUBLISH_CHECKLIST.md**: Checklist for publishing
- **PROJECT_STRUCTURE.md**: This file

### Assets

- **icons/**: Extension icons (16x16, 48x48, 128x128)
- **LICENSE**: MIT License

## Key Components

### Content Script (content.js)

- Injects "Simplify" button into LeetCode pages
- Handles button clicks and UI updates
- Manages simplified content display
- Handles extension context invalidation
- Integrates with providers.js for LLM calls

### Providers (providers.js)

- Unified interface for all LLM providers
- Supports cloud providers (Gemini, OpenAI, Anthropic, Cohere, Mistral)
- Supports local LLMs (Ollama) with automatic fallback
- Handles API calls, errors, and responses
- Manages authentication and API keys

### Prompts (prompts.json)

- **simplifyNoHint**: Prompt for problem simplification without hints
- **simplifyWithHint**: Prompt for problem simplification with hints
- Structured output format (Task, Inputs, Output, Rules, Edge Cases, Example)
- Detailed dry-run style example explanations

### Settings Popup (ui/popup.js)

- Provider selection (Gemini, ChatGPT, Claude, Cohere, Mistral, Local)
- API key input
- Endpoint and model configuration (for local LLMs)
- Mode selection (No Hint / With Hint)
- Settings persistence (Chrome storage)

## Data Flow

1. User visits LeetCode problem page
2. Content script injects "Simplify" button
3. User clicks "Simplify" button
4. Content script extracts problem description
5. Providers.js calls selected LLM provider
6. LLM returns simplified problem
7. Content script displays simplified problem
8. User can regenerate or change settings

## Extension Permissions

- **storage**: Save user settings
- **activeTab**: Access LeetCode pages
- **host_permissions**: 
  - LeetCode domains
  - AI provider APIs
  - Localhost (for local LLMs)

## Dependencies

- **None**: Pure vanilla JavaScript, no external dependencies
- **Chrome APIs**: chrome.storage, chrome.runtime, chrome.tabs
- **Browser APIs**: fetch, DOM APIs

## Browser Support

- Chrome 88+ (or any Chromium-based browser)
- Edge, Brave, Opera, etc.

## Build Process

No build process required - the extension uses vanilla JavaScript.

## Testing

Manual testing on:
- Different LeetCode problem pages
- Different AI providers
- Local LLM (Ollama)
- Different browsers
- Error scenarios

## Deployment

1. Load unpacked extension in Chrome (Developer mode)
2. Test thoroughly
3. Create release on GitHub
4. Submit to Chrome Web Store (optional)

---

For more information, see [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

