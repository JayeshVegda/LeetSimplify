# Security Policy

## Supported Versions

We actively support the following versions of LeetSimplify:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### API Keys

- **Never commit API keys** to the repository
- API keys are stored locally in Chrome's sync storage (encrypted)
- Use environment variables for development if needed
- Rotate API keys regularly
- Use least-privilege API keys when possible

### Local LLMs

- Local LLMs provide the best privacy (no data leaves your machine)
- Ensure Ollama is only accessible from localhost
- Don't expose Ollama to the internet without proper security

### Extension Permissions

The extension requests minimal permissions:
- `storage` - For saving settings
- `activeTab` - For accessing LeetCode pages
- `host_permissions` - Only for necessary API endpoints and LeetCode

## Reporting a Vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead:

1. **Email** the maintainers directly (if contact info is available)
2. **Create a private security advisory** on GitHub (if you have access)
3. **Describe the vulnerability** in detail
4. **Provide steps to reproduce** (if possible)
5. **Suggest a fix** (if you have one)

We will respond as quickly as possible and work with you to resolve the issue.

## Security Considerations

### Data Privacy

- **Cloud providers**: Problem descriptions are sent to API providers
- **Local LLMs**: Complete privacy - no data leaves your machine
- **Extension storage**: Settings stored locally in Chrome (encrypted by Chrome)

### Network Security

- All API requests use HTTPS (except local LLMs)
- Local LLM connections are localhost-only
- CORS is properly configured for local LLMs

### Code Security

- No external dependencies (vanilla JavaScript)
- No eval() or unsafe code execution
- Input validation for user inputs
- Error handling to prevent information leakage

## Updates

We regularly update the extension to:
- Fix security vulnerabilities
- Update dependencies (if any)
- Improve error handling
- Enhance security practices

**Always use the latest version** of the extension for best security.

## Disclaimer

This extension is provided as-is. Users are responsible for:
- Protecting their API keys
- Using secure connections
- Understanding data privacy implications
- Keeping the extension updated

