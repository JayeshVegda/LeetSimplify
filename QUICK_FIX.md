# Quick Fix for Ollama Connection Issues

## Option 1: Set CORS (Recommended)

**Windows (Quick):**
1. Open Command Prompt as Administrator
2. Run: `setx OLLAMA_ORIGINS "chrome-extension://*" /M`
3. Restart Ollama (Task Manager → End Ollama process, it will restart automatically)
4. Reload the extension in Chrome

**Verify it worked:**
```bash
curl http://127.0.0.1:11434/api/version
```

## Option 2: Use Native API (No CORS Setup Needed)

If CORS setup is too complicated, use Ollama's native API endpoint instead:

1. Open extension settings
2. Select "Local (Ollama/Self-hosted)" provider
3. Set **Endpoint** to: `http://127.0.0.1:11434/api/generate`
4. Set **Model** to: `mistral` (or your model name)
5. Click "Save Settings"
6. Try again!

The native API endpoint might work without CORS issues in some cases.

## Option 3: Automatic Fallback

The extension will **automatically try the native API** if the OpenAI-compatible endpoint fails!

Just make sure:
- Ollama is running
- Model is downloaded (`ollama list` to check)
- Endpoint is set to: `http://127.0.0.1:11434/v1/chat/completions`

The extension will automatically fallback to native API if needed.

## Still Not Working?

1. **Check Ollama is running:**
   ```bash
   curl http://127.0.0.1:11434/api/version
   ```

2. **Check browser console (F12):**
   - Look for `[LeetSimplify]` logs
   - Check for specific error messages

3. **Test endpoint directly:**
   ```bash
   # Test native API
   curl http://127.0.0.1:11434/api/generate \
     -H "Content-Type: application/json" \
     -d '{"model": "mistral", "prompt": "Hello", "stream": false}'
   ```

4. **Check Ollama logs:**
   - Windows: Check Event Viewer or Ollama logs
   - Linux/Mac: `journalctl -u ollama` or check Ollama process output

## Need More Help?

See [OLLAMA_SETUP.md](OLLAMA_SETUP.md) for detailed instructions.


