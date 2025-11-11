# Contributing to LeetSimplify

Thank you for your interest in contributing to LeetSimplify! This document provides guidelines and instructions for contributing.

## How to Contribute

### Reporting Bugs

1. **Check existing issues** - Make sure the bug hasn't been reported already
2. **Create a new issue** with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and extension version
   - Console error messages (if any)
   - Screenshots (if applicable)

### Suggesting Features

1. **Check existing issues** - See if the feature has been suggested
2. **Create a feature request** with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach (optional)

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test thoroughly**:
   - Test on actual LeetCode pages
   - Test with different providers
   - Test with both modes (No Hint / With Hint)
   - Check browser console for errors
5. **Commit your changes**:
   ```bash
   git commit -m 'Add: description of your changes'
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request**

## Development Setup

### Prerequisites

- Chrome browser (or Chromium-based)
- Git
- Text editor/IDE

### Setup Steps

1. **Clone your fork**:
   ```bash
   git clone https://github.com/JayeshVegda/LeetSimplify.git
   cd LeetSimplify
   ```

2. **Load extension in Chrome**:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the LeetSimplify directory

3. **Make changes** and reload the extension to test

### Code Style

- Use **vanilla JavaScript** (no frameworks)
- Follow existing code style and patterns
- Add comments for complex logic
- Use meaningful variable names
- Keep functions focused and small

### File Structure

- `content.js` - Main content script (LeetCode integration)
- `providers.js` - LLM provider implementations
- `prompts.json` - AI prompts (be careful with formatting)
- `styles.css` - Extension styles
- `ui/popup.js` - Settings popup logic
- `ui/popup.html` - Settings popup HTML
- `ui/popup.css` - Settings popup styles

## Testing

### Manual Testing

1. Test on different LeetCode problem pages
2. Test with different AI providers
3. Test with both modes (No Hint / With Hint)
4. Test local LLM setup (Ollama)
5. Test error handling (invalid API keys, network errors)
6. Test on different browsers (Chrome, Edge, Brave)

### Checklist

Before submitting a PR, ensure:
- [ ] Code works on actual LeetCode pages
- [ ] No console errors
- [ ] All providers work correctly
- [ ] Local LLM setup works (if changed)
- [ ] Error handling is proper
- [ ] UI looks good and is responsive
- [ ] No breaking changes (unless intentional)

## Pull Request Process

1. **Update documentation** if needed
2. **Update version** in `manifest.json` if needed
3. **Test thoroughly** before submitting
4. **Write clear PR description**:
   - What changes were made
   - Why the changes were made
   - How to test the changes
5. **Link related issues** if applicable

## Guidelines

### Adding New Providers

1. Add provider to `providers.js`
2. Add provider option to `ui/popup.html`
3. Add provider to `ui/popup.js`
4. Update `PROVIDER_LABELS` in `content.js`
5. Update `manifest.json` host_permissions if needed
6. Update README.md with new provider

### Modifying Prompts

1. Be careful with JSON formatting in `prompts.json`
2. Test prompts with different problems
3. Ensure prompts preserve all problem details
4. Keep prompts concise but complete

### UI Changes

1. Maintain consistent styling
2. Support both light and dark modes
3. Ensure responsive design
4. Test on different screen sizes

## Questions?

If you have questions about contributing:
- Open an issue with the "question" label
- Check existing issues and discussions
- Review the code and documentation

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

Thank you for contributing to LeetSimplify! 🚀

