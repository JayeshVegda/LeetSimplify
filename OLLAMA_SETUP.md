# Ollama Setup for LeetSimplify

## Issue: "Cannot connect to local LLM server"

If you're getting connection errors, it's likely a **CORS (Cross-Origin Resource Sharing)** issue. Browser extensions need Ollama to allow requests from different origins.

## Solution: Configure Ollama CORS

### Windows

1. **Set Environment Variable (Method 1 - Permanent):**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"
   - Under "System Variables", click "New"
   - Variable name: `OLLAMA_ORIGINS`
   - Variable value: `chrome-extension://*`
   - Click OK to save
   - **Restart your computer** for the change to take effect

2. **Set Environment Variable (Method 2 - Quick Test):**
   - Open Command Prompt as Administrator
   - Run: `setx OLLAMA_ORIGINS "chrome-extension://*" /M`
   - Restart Ollama service

3. **Restart Ollama:**
   - Open Task Manager (Ctrl + Shift + Esc)
   - Find "Ollama" process and end it
   - Restart Ollama (it should start automatically, or run `ollama serve` in a new terminal)

### macOS

1. **Set Environment Variable:**
   ```bash
   launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"
   ```

2. **Make it permanent (add to ~/.zshrc or ~/.bash_profile):**
   ```bash
   echo 'export OLLAMA_ORIGINS="chrome-extension://*"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Restart Ollama:**
   ```bash
   # Stop Ollama
   killall ollama
   
   # Start Ollama (usually starts automatically)
   ollama serve
   ```

### Linux

1. **Set Environment Variable:**
   ```bash
   export OLLAMA_ORIGINS="chrome-extension://*"
   ```

2. **Make it permanent (add to ~/.bashrc or ~/.zshrc):**
   ```bash
   echo 'export OLLAMA_ORIGINS="chrome-extension://*"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Or set system-wide (in /etc/environment):**
   ```bash
   sudo echo 'OLLAMA_ORIGINS="chrome-extension://*"' >> /etc/environment
   ```

4. **Restart Ollama service:**
   ```bash
   sudo systemctl restart ollama
   # OR if running manually:
   killall ollama
   ollama serve
   ```

## Verify Setup

1. **Test Ollama is running:**
   ```bash
   curl http://127.0.0.1:11434/api/version
   ```
   Should return version information.

2. **Test OpenAI-compatible endpoint:**
   ```bash
   curl http://127.0.0.1:11434/v1/chat/completions \
     -H "Content-Type: application/json" \
     -d '{
       "model": "mistral",
       "messages": [{"role": "user", "content": "Hello"}],
       "temperature": 0.3
     }'
   ```
   Should return a JSON response with the model's reply.

3. **Test from browser console:**
   Open browser DevTools (F12) and run:
   ```javascript
   fetch('http://127.0.0.1:11434/v1/chat/completions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       model: 'mistral',
       messages: [{ role: 'user', content: 'Hello' }],
       temperature: 0.3
     })
   }).then(r => r.json()).then(console.log).catch(console.error);
   ```
   Should return a response without CORS errors.

## Alternative: Use Ollama's Native API

If the OpenAI-compatible endpoint doesn't work, the extension will **automatically fallback** to Ollama's native API!

**You can also manually use the native endpoint:**

**Endpoint:** `http://127.0.0.1:11434/api/generate`

1. In extension settings, set the endpoint to: `http://127.0.0.1:11434/api/generate`
2. Set your model name (e.g., `mistral`)
3. Save settings

The extension will automatically detect and use the native API format.

## Troubleshooting

### Issue: "Connection refused"
- **Solution:** Make sure Ollama is running: `ollama serve`

### Issue: "404 Not Found"
- **Solution:** Check if the endpoint is correct: `http://127.0.0.1:11434/v1/chat/completions`
- Some Ollama versions might need the endpoint enabled

### Issue: "CORS policy" error
- **Solution:** Set `OLLAMA_ORIGINS=*` environment variable and restart Ollama

### Issue: "Model not found"
- **Solution:** Make sure the model is downloaded: `ollama pull mistral`
- Check available models: `ollama list`

### Issue: Extension still can't connect after setting CORS
- **Solution:** 
  1. Verify environment variable is set: `echo $OLLAMA_ORIGINS` (Linux/Mac) or check System Properties (Windows)
  2. Completely restart Ollama service
  3. Reload the browser extension
  4. Check browser console for specific error messages

## Need Help?

If you're still having issues:
1. Check browser console (F12) for detailed error messages
2. Verify Ollama is accessible: `curl http://127.0.0.1:11434/api/version`
3. Test the endpoint directly with curl
4. Check Ollama logs for errors

