// LeetSimplify Providers
// Unified LLM provider calls with optional backend endpoints
// Exposes window.LeetSimplifyProviders

(function() {
  'use strict';

  const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
  const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  function safeText(value) {
    if (typeof value === 'string') return value;
    if (value == null) return '';
    try { return String(value); } catch { return ''; }
  }

  // Safely get runtime URL, handling context invalidation
  function safeGetRuntimeURL(path) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        // Check if context is valid by accessing runtime.id
        void chrome.runtime.id;
        return chrome.runtime.getURL(path);
      }
    } catch (err) {
      // Context invalidated or chrome.runtime not available - fallback to relative path
    }
    return './' + path;
  }

  // Load prompts.json once and cache in-memory
  let __promptsCache = null;
  async function loadPrompts() {
    if (__promptsCache) return __promptsCache;
    const url = safeGetRuntimeURL('prompts.json');
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load prompts.json: ${res.status} ${res.statusText}`);
    __promptsCache = await res.json();
    return __promptsCache;
  }

  async function getPromptByKey(key) {
    const prompts = await loadPrompts();
    const text = (prompts && prompts.prompts && prompts.prompts[key]) || prompts?.[key];
    if (!text) throw new Error(`Prompt key not found in prompts.json: ${key}`);
    return safeText(text);
  }

  function buildSimplifyPrompt(basePrompt, problemText) {
    return `${safeText(basePrompt)}\n\nProblem Description:\n${safeText(problemText)}`;
  }

  async function callGemini({ apiKey, endpoint, prompt, model }) {
    const targetModel = model || DEFAULT_GEMINI_MODEL;
    const targetEndpoint = endpoint || `${GEMINI_API_BASE}/${targetModel}:generateContent`;
    const url = `${targetEndpoint}?key=${encodeURIComponent(apiKey)}`;
    const body = {
      contents: [{ parts: [{ text: prompt }]}]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Gemini returned empty response');
    return text;
  }

  async function callOpenAI({ apiKey, endpoint, prompt, model, skipAuth = false }) {
    const url = endpoint || 'https://api.openai.com/v1/chat/completions';
    const body = {
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    };
    const headers = {
      'Content-Type': 'application/json'
    };
    // For local providers (Ollama), API key is optional
    if (!skipAuth && apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const isLocal = url.includes('127.0.0.1') || url.includes('localhost');
    
    try {
      console.log('[LeetSimplify] Making request to:', url);
      console.log('[LeetSimplify] Request body:', JSON.stringify(body, null, 2));
      
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      
      console.log('[LeetSimplify] Response status:', res.status, res.statusText);
      
      if (!res.ok) {
        let errorMessage = `Request failed: ${res.status} ${res.statusText}`;
        try {
          const err = await res.json();
          console.log('[LeetSimplify] Error response:', err);
          errorMessage = err.error?.message || err.message || errorMessage;
          
          // Special handling for common errors
          if (res.status === 404) {
            if (isLocal) {
              errorMessage = 'Endpoint not found. Make sure Ollama is running and supports OpenAI-compatible API at: ' + url;
            }
          } else if (res.status === 400) {
            errorMessage = err.error?.message || 'Invalid request. Check your model name and endpoint.';
          } else if (res.status === 500) {
            errorMessage = err.error?.message || 'Server error. Check if the model is loaded: ' + (model || 'unknown');
          }
        } catch (e) {
          // If response isn't JSON, use status text
          const responseText = await res.text().catch(() => '');
          console.log('[LeetSimplify] Non-JSON error response:', responseText);
          if (responseText) {
            errorMessage += ` - ${responseText.substring(0, 100)}`;
          }
        }
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      console.log('[LeetSimplify] Response data:', data);
      const text = data?.choices?.[0]?.message?.content;
      if (!text) {
        // Ollama sometimes returns responses in a slightly different format
        if (data?.response) {
          return data.response;
        }
        throw new Error('Empty response from server. Check if the model is loaded and try again.');
      }
      return text;
    } catch (error) {
      console.error('[LeetSimplify] Request error:', error);
      
      // Enhanced error messages for network issues
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('NetworkError') || 
          error.message.includes('CORS') ||
          error.name === 'TypeError') {
        if (isLocal) {
          const baseUrl = url.replace('/v1/chat/completions', '');
          // Don't throw here if it's Ollama - let the fallback to native API try
          throw error; // Re-throw to trigger native API fallback
        }
        throw new Error('Network error: ' + error.message);
      }
      throw error;
    }
  }

  async function callAnthropic({ apiKey, endpoint, prompt, model }) {
    const url = endpoint || 'https://api.anthropic.com/v1/messages';
    const body = {
      model: model || 'claude-3-5-sonnet-latest',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const text = data?.content?.[0]?.text || (Array.isArray(data?.content) ? data.content.map(p => p?.text).filter(Boolean).join('\n') : '');
    if (!text) throw new Error('Anthropic returned empty response');
    return text;
  }

  async function callCohere({ apiKey, endpoint, prompt, model }) {
    const url = endpoint || 'https://api.cohere.ai/v1/chat';
    const body = {
      model: model || 'command-r-plus',
      message: prompt,
      temperature: 0.3
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Cohere error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const text = data?.text || data?.message?.content || '';
    if (!text) throw new Error('Cohere returned empty response');
    return text;
  }

  async function callMistral({ apiKey, endpoint, prompt, model }) {
    const url = endpoint || 'https://api.mistral.ai/v1/chat/completions';
    const body = {
      model: model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Mistral error: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('Mistral returned empty response');
    return text;
  }

  // Ollama native API (fallback if OpenAI-compatible API doesn't work)
  async function callOllamaNative({ endpoint, prompt, model }) {
    // Convert endpoint from OpenAI format to Ollama native format
    const baseUrl = endpoint ? endpoint.replace('/v1/chat/completions', '') : 'http://127.0.0.1:11434';
    const url = `${baseUrl}/api/generate`;
    
    const body = {
      model: model || 'mistral',
      prompt: prompt,
      stream: false
    };
    
    console.log('[LeetSimplify] Using Ollama native API:', url);
    console.log('[LeetSimplify] Request body:', JSON.stringify(body, null, 2));
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      console.log('[LeetSimplify] Ollama native response status:', res.status, res.statusText);
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Ollama error: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('[LeetSimplify] Ollama native response:', data);
      const text = data?.response;
      if (!text) throw new Error('Ollama returned empty response. Check if the model is loaded.');
      return text;
    } catch (error) {
      console.error('[LeetSimplify] Ollama native API error:', error);
      throw error;
    }
  }

  async function generateSimplified({ provider, basePrompt, problemText, apiKeys = {}, endpoints = {}, models = {} }) {
    const prompt = buildSimplifyPrompt(basePrompt, problemText);
    const prov = (provider || 'gemini').toLowerCase();

    if (prov === 'gemini') {
      const key = apiKeys.gemini || apiKeys.apiKey || apiKeys.default;
      if (!key) throw new Error('Please set your Gemini API key.');
      return await callGemini({ apiKey: key, endpoint: endpoints.gemini, prompt, model: models.gemini });
    }

    if (prov === 'openai' || prov === 'chatgpt') {
      const key = apiKeys.openai || apiKeys.chatgpt || apiKeys.default;
      if (!key) throw new Error('Please set your OpenAI API key.');
      return await callOpenAI({ apiKey: key, endpoint: endpoints.openai, prompt, model: models.openai });
    }

    if (prov === 'anthropic' || prov === 'claude') {
      const key = apiKeys.anthropic || apiKeys.claude || apiKeys.default;
      if (!key) throw new Error('Please set your Anthropic API key.');
      return await callAnthropic({ apiKey: key, endpoint: endpoints.anthropic, prompt, model: models.anthropic });
    }

    if (prov === 'cohere') {
      const key = apiKeys.cohere || apiKeys.default;
      if (!key) throw new Error('Please set your Cohere API key.');
      return await callCohere({ apiKey: key, endpoint: endpoints.cohere, prompt, model: models.cohere });
    }

    if (prov === 'mistral') {
      const key = apiKeys.mistral || apiKeys.default;
      if (!key) throw new Error('Please set your Mistral API key.');
      return await callMistral({ apiKey: key, endpoint: endpoints.mistral, prompt, model: models.mistral });
    }

    if (prov === 'local') {
      // Local provider (Ollama, LM Studio, etc.)
      const endpoint = endpoints.local;
      const model = models.local;
      if (!endpoint) throw new Error('Please set your local API endpoint (e.g., http://127.0.0.1:11434/v1/chat/completions)');
      if (!model) throw new Error('Please set your local model name (e.g., mistral, llama3)');
      
      const isOllama = endpoint.includes('127.0.0.1:11434') || endpoint.includes('localhost:11434');
      const useOpenAIFormat = endpoint.includes('/v1/chat/completions');
      
      // Try OpenAI-compatible API first, fallback to Ollama native API
      if (useOpenAIFormat) {
        try {
          const key = apiKeys.local || apiKeys.default || 'local';
          return await callOpenAI({ apiKey: key, endpoint, prompt, model, skipAuth: true });
        } catch (error) {
          // If OpenAI-compatible API fails and it's Ollama, try native API
          if (isOllama && (error.message.includes('Failed to fetch') || 
              error.message.includes('NetworkError') || 
              error.message.includes('Cannot connect'))) {
            console.log('[LeetSimplify] OpenAI-compatible API failed, trying Ollama native API...');
            return await callOllamaNative({ endpoint, prompt, model });
          }
          throw error;
        }
      } else if (isOllama && endpoint.includes('/api/generate')) {
        // Direct native API endpoint
        return await callOllamaNative({ endpoint, prompt, model });
      } else {
        // Try as OpenAI-compatible API (for LM Studio, etc.)
        const key = apiKeys.local || apiKeys.default || 'local';
        return await callOpenAI({ apiKey: key, endpoint, prompt, model, skipAuth: true });
      }
    }

    throw new Error(`Unsupported provider: ${provider}`);
  }

  // Convenience: generate using a prompt key from prompts.json
  async function generateSimplifiedFromPromptKey({ provider, promptKey, problemText, apiKeys = {}, endpoints = {}, models = {} }) {
    const basePrompt = await getPromptByKey(promptKey);
    return generateSimplified({ provider, basePrompt, problemText, apiKeys, endpoints, models });
  }

  window.LeetSimplifyProviders = {
    generateSimplified,
    generateSimplifiedFromPromptKey,
    loadPrompts,
    getPromptByKey
  };
})();


