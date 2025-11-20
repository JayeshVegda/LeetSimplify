# <div align="center">LeetSimplify</div>

<div align="center">
  <img src="icons/icon128.png" alt="LeetSimplify logo" width="120" />

  <p><strong>Turn dense LeetCode statements into clear, friendly briefs.</strong><br/>
  <em>AI-powered simplification that keeps every detail intact.</em></p>

  <a href="https://github.com/JayeshVegda/LeetSimplify">github.com/JayeshVegda/LeetSimplify</a>

  <p>
    <img src="https://img.shields.io/badge/Chrome%20Extension-MV3-4285F4?style=for-the-badge" alt="Chrome Extension">
    <img src="https://img.shields.io/badge/AI%20Providers-Gemini%20|%20Claude%20|%20GPT-FFB84D?style=for-the-badge" alt="AI Providers">
    <img src="https://img.shields.io/badge/Tech-JavaScript%20%7C%20CSS%20%7C%20HTML-8BC34A?style=for-the-badge" alt="Tech Stack">
  </p>
</div>

## Project Overview

LeetSimplify is a Manifest V3 Chrome extension that rewrites any LeetCode problem description into concise, easy-to-digest language without dropping constraints, formats, or edge cases. It plugs directly into problem pages, speaks to multiple AI providers (Gemini, GPT-4o, Claude, Cohere, Mistral, or a local Ollama endpoint), and gives you a toggleable hint mode whenever you need strategic nudges.

## Key Features

- ✨ **One-click simplification** – Injects a contextual button directly inside every LeetCode problem view.
- 🧠 **Multi-provider intelligence** – Gemini by default, with instant switching to OpenAI, Anthropic, Cohere, Mistral, or self-hosted models.
- 🧭 **Mode-aware prompts** – Choose between detail-only summaries or hint-enriched rewrites powered by curated prompt templates.
- ♻️ **Regenerate & retry** – Keeps request history so you can tweak providers or prompts and regenerate instantly.
- ⚙️ **Rich popup controls** – Minimal UI for toggling features, updating API keys, swapping models, or pointing to custom endpoints.
- 🛡️ **Context-safe storage** – Guards against Chrome context invalidation and guides you whenever a page refresh is required.

## Screenshots & Demo

https://github.com/user-attachments/assets/7ebf1577-bb2d-4110-80f5-4b4ba3397bba


## Installation

1. Download or clone the repository:
   ```bash
   git clone https://github.com/JayeshVegda/LeetSimplify.git
   cd LeetSimplify
   ```
2. Open `chrome://extensions` in Chrome (or Arc, Brave, Edge with Chromium).
3. Toggle **Developer mode**.
4. Choose **Load unpacked** and select the `LeetSimplify` folder.
5. Pin the extension for quick access if desired.

## How to Run / Usage

1. Visit any LeetCode problem page (`/problems/...`).
2. Click the **Simplify** button that appears near the difficulty/tags row or description header.
3. Manage preferences from the popup (`Extensions toolbar → LeetSimplify`):
   - Toggle simplification on/off.
   - Switch between *No Hint* and *With Hint* modes.
   - Select your preferred AI provider and paste the corresponding API key (use `"local"` for Ollama-style endpoints).
4. Regenerate responses or change providers on the fly—no page refresh needed unless Chrome invalidates the extension context (LeetSimplify warns you when that happens).

## Folder Structure

```
LeetSimplify/
├─ manifest.json          # Chrome MV3 configuration
├─ content.js            # In-page injector & AI orchestration
├─ providers.js          # Provider-specific request helpers
├─ styles.css            # In-problem UI styles
├─ prompts.json          # Structured prompt templates & defaults
├─ ui/
│  ├─ popup.html
│  ├─ popup.css
│  └─ popup.js          # Extension action UI logic
├─ icons/                # App icons & demo media
└─ docs/                 # Static assets or marketing preview
```

## Contributing

Contributions, bug reports, and feature ideas are welcome! To keep everything smooth:

1. Read `CONTRIBUTING.md` for coding standards and security guidance.
2. Fork, branch, and open a pull request describing your changes.
3. If you’re adding a provider or prompt variation, update `prompts.json` and any relevant documentation.

## License

Distributed under the **MIT License**. See `LICENSE` for details.

## Contact

- **Author:** Jayesh Vegda  
- **GitHub:** [@JayeshVegda](https://github.com/JayeshVegda)  
- **Issues & Support:** Use the [GitHub issue tracker](https://github.com/JayeshVegda/LeetSimplify/issues)

_Built for problem solvers who want clarity without compromise._

