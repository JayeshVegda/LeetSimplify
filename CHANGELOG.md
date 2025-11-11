# Changelog

All notable changes to LeetSimplify will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-XX

### Added
- ✨ Local LLM support (Ollama) - Use local models for complete privacy
- 🔄 Automatic fallback to Ollama native API if OpenAI-compatible API fails
- 📝 Enhanced prompts for complete problem preservation
- 🎨 Improved regenerate button positioning (inline with mode/provider chips)
- 📚 Detailed dry-run style example explanations
- 🔧 Better error handling with detailed error messages
- 🌐 Support for localhost and 127.0.0.1 endpoints
- 📖 Comprehensive setup documentation (OLLAMA_SETUP.md, QUICK_FIX.md)

### Changed
- 🎨 Regenerate button now appears inline with meta information
- 📝 Prompts now preserve ALL problem details (conditions, constraints, edge cases)
- 🎯 Example explanations are now more detailed with step-by-step dry-runs
- 🔧 Improved error messages for better debugging
- 📚 Updated README with comprehensive documentation

### Fixed
- 🐛 Extension context invalidation handling
- 🐛 CORS issues with local LLM servers
- 🐛 Error handling for network failures
- 🐛 Storage access error handling

## [1.0.1] - 2025-01-XX

### Added
- 🎯 Multiple AI provider support (Gemini, ChatGPT, Claude, Cohere, Mistral)
- 🎨 Two simplification modes (No Hint / With Hint)
- 🔄 Regenerate functionality
- 🎨 Beautiful UI integrated with LeetCode
- 🔒 Privacy-focused design

### Changed
- 📝 Improved prompt quality
- 🎨 Enhanced UI styling

### Fixed
- 🐛 Initial bugs and issues

## [1.0.0] - 2025-01-XX

### Added
- 🎉 Initial release
- ✨ Basic problem simplification
- 🎨 Extension UI
- 🔧 Basic provider support

---

[1.1.0]: https://github.com/JayeshVegda/LeetSimplify/releases/tag/v1.1.0
[1.0.1]: https://github.com/JayeshVegda/LeetSimplify/releases/tag/v1.0.1
[1.0.0]: https://github.com/JayeshVegda/LeetSimplify/releases/tag/v1.0.0

