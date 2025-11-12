(function() {
  'use strict';

  const providerIds = ['gemini', 'anthropic', 'openai', 'cohere', 'mistral', 'local'];
  const providerNames = {
    gemini: 'Gemini',
    anthropic: 'Anthropic (Claude)',
    openai: 'OpenAI (ChatGPT)',
    cohere: 'Cohere',
    mistral: 'Mistral',
    local: 'Local (Ollama)'
  };

  const providerApiUrls = {
    gemini: 'https://aistudio.google.com/app/apikey',
    anthropic: 'https://console.anthropic.com/settings/keys',
    openai: 'https://platform.openai.com/api-keys',
    cohere: 'https://dashboard.cohere.com/api-keys',
    mistral: 'https://console.mistral.ai/api-keys/',
    local: 'https://github.com/ollama/ollama'
  };

  const enabledToggle = document.getElementById('enabledToggle');
  const statusBadge = document.getElementById('statusBadge');
  const segButtons = Array.from(document.querySelectorAll('.seg-btn'));
  const providerSelect = document.getElementById('providerSelect');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const apiKeyHint = document.getElementById('apiKeyHint');
  const apiKeyHelpLink = document.getElementById('apiKeyHelpLink');
  const endpointInput = document.getElementById('endpointInput');
  const endpointField = document.getElementById('endpointField');
  const modelInput = document.getElementById('modelInput');
  const modelField = document.getElementById('modelField');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');

  const defaultConfig = {
    enabled: true,
    mode: 'noHint',
    provider: 'gemini',
    apiKeys: {},
    apiKey: ''
  };

  let currentMode = defaultConfig.mode;

  init();

  function init() {
    bindEvents();
    loadConfig();
  }

  function bindEvents() {
    enabledToggle.addEventListener('change', async () => {
      updateStatusBadge();
      await autoSaveEnabled();
    });
    
    segButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        setMode(btn.dataset.mode);
        await autoSaveMode();
      });
    });

    providerSelect.addEventListener('change', () => {
      clearValidation();
      updateApiLabel();
      updateLocalFields();
      loadProviderKey(providerSelect.value);
    });

    saveBtn.addEventListener('click', handleSave);
    resetBtn.addEventListener('click', handleReset);
  }

  function updateStatusBadge() {
    if (statusBadge) {
      const isEnabled = enabledToggle.checked;
      statusBadge.classList.toggle('inactive', !isEnabled);
      const statusText = statusBadge.querySelector('.status-text');
      if (statusText) {
        statusText.textContent = isEnabled ? 'Active' : 'Inactive';
      }
    }
  }

  async function autoSaveEnabled() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const current = await new Promise(resolve => {
          chrome.storage.sync.get(['enabled', 'mode', 'provider', 'apiKeys', 'apiKey', 'endpoints', 'models'], (s) => resolve(s || {}));
        });
        await chrome.storage.sync.set({
          ...current,
          enabled: enabledToggle.checked
        });
      }
    } catch (err) {
      console.error('Failed to auto-save enabled state:', err);
    }
  }

  async function autoSaveMode() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        const current = await new Promise(resolve => {
          chrome.storage.sync.get(['enabled', 'mode', 'provider', 'apiKeys', 'apiKey', 'endpoints', 'models'], (s) => resolve(s || {}));
        });
        await chrome.storage.sync.set({
          ...current,
          mode: currentMode
        });
      }
    } catch (err) {
      console.error('Failed to auto-save mode:', err);
    }
  }

  function loadConfig() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['enabled', 'mode', 'provider', 'apiKeys', 'apiKey', 'endpoints', 'models'], stored => {
        const cfg = {
          ...defaultConfig,
          ...stored,
          apiKeys: { ...(stored.apiKeys || {}) },
          endpoints: { ...(stored.endpoints || {}) },
          models: { ...(stored.models || {}) }
        };
        if (!cfg.apiKeys.gemini && cfg.apiKey) cfg.apiKeys.gemini = cfg.apiKey;

        enabledToggle.checked = cfg.enabled !== false;
        updateStatusBadge();
        setMode(cfg.mode || 'noHint');
        const validProvider = providerIds.includes((cfg.provider || '').toLowerCase()) ? cfg.provider : 'gemini';
        providerSelect.value = validProvider;
        updateApiLabel();
        updateLocalFields();
        apiKeyInput.value = cfg.apiKeys[validProvider] || '';
        endpointInput.value = cfg.endpoints[validProvider] || '';
        modelInput.value = cfg.models[validProvider] || '';
      });
    } else {
      enabledToggle.checked = defaultConfig.enabled;
      updateStatusBadge();
      setMode(defaultConfig.mode);
      providerSelect.value = defaultConfig.provider;
      updateApiLabel();
      updateLocalFields();
      apiKeyInput.value = '';
      endpointInput.value = '';
      modelInput.value = '';
    }
  }

  function loadProviderKey(provider) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(['apiKeys', 'apiKey', 'endpoints', 'models'], stored => {
        const apiKeys = stored.apiKeys || {};
        const endpoints = stored.endpoints || {};
        const models = stored.models || {};
        if (!apiKeys.gemini && stored.apiKey) apiKeys.gemini = stored.apiKey;
        apiKeyInput.value = apiKeys[provider] || '';
        endpointInput.value = endpoints[provider] || '';
        modelInput.value = models[provider] || '';
        if (provider === 'local') {
          if (!endpointInput.value) endpointInput.value = 'http://127.0.0.1:11434/v1/chat/completions';
          if (!modelInput.value) modelInput.value = 'mistral';
        }
      });
    } else {
      apiKeyInput.value = '';
      endpointInput.value = '';
      modelInput.value = '';
    }
  }

  function setMode(mode) {
    const allowed = ['noHint', 'withHint'];
    currentMode = allowed.includes(mode) ? mode : 'noHint';
    segButtons.forEach(btn => {
      const isActive = btn.dataset.mode === currentMode;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', String(isActive));
    });
  }

  function updateApiLabel() {
    const id = (providerSelect.value || 'gemini').toLowerCase();
    const name = providerNames[id] || 'Provider';
    const cleanName = name.replace(/\(.+\)/, '').trim();
    apiKeyLabel.textContent = `${cleanName} API Key`;
    apiKeyInput.placeholder = id === 'local' ? 'Optional (use "local" or leave empty)' : `Paste ${cleanName} API key`;
    
    // Update help link
    if (apiKeyHelpLink && providerApiUrls[id]) {
      apiKeyHelpLink.href = providerApiUrls[id];
    }
  }

  function updateLocalFields() {
    const isLocal = providerSelect.value === 'local';
    endpointField.style.display = isLocal ? 'block' : 'none';
    modelField.style.display = isLocal ? 'block' : 'none';
    apiKeyHint.style.display = isLocal ? 'block' : 'none';
    if (isLocal && !endpointInput.value) {
      endpointInput.value = 'http://127.0.0.1:11434/v1/chat/completions';
    }
    if (isLocal && !modelInput.value) {
      modelInput.value = 'mistral';
    }
  }

  async function handleSave() {
    clearValidation();
    const cfg = await gatherFormData();
    // For local provider, API key is optional, but endpoint and model are required
    if (cfg.enabled) {
      if (cfg.provider === 'local') {
        const missingEndpoint = !cfg.endpoints.local;
        const missingModel = !cfg.models.local;
        if (missingEndpoint) endpointInput.classList.add('input-invalid');
        if (missingModel) modelInput.classList.add('input-invalid');
        if (missingEndpoint || missingModel) {
          flashButton(saveBtn);
          return;
        }
      } else if (!(cfg.apiKeys[cfg.provider] || cfg.apiKeys.default)) {
        apiKeyInput.classList.add('input-invalid');
        flashButton(saveBtn);
        return;
      }
    }

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        await chrome.storage.sync.set(cfg);
      }
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saved';
      saveBtn.classList.add('is-pulsing');
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
        saveBtn.classList.remove('is-pulsing');
      }, 900);
    } catch {
      saveBtn.classList.remove('is-pulsing');
      saveBtn.textContent = 'Retry';
      setTimeout(() => (saveBtn.textContent = 'Save'), 1400);
    }
  }

  async function handleReset() {
    const resetCfg = {
      enabled: true,
      mode: 'noHint',
      provider: 'gemini',
      apiKeys: {},
      apiKey: '',
      endpoints: {},
      models: {}
    };
    enabledToggle.checked = true;
    updateStatusBadge();
    setMode('noHint');
    providerSelect.value = 'gemini';
    updateApiLabel();
    updateLocalFields();
    apiKeyInput.value = '';
    endpointInput.value = '';
    modelInput.value = '';
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      await chrome.storage.sync.set(resetCfg);
    }
    saveBtn.disabled = false;
    saveBtn.classList.remove('is-pulsing');
    saveBtn.textContent = 'Save';
    clearValidation();
  }

  async function gatherFormData() {
    let stored = {};
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      stored = await new Promise(resolve => {
        chrome.storage.sync.get(['apiKeys', 'apiKey', 'endpoints', 'models'], (s) => resolve(s || {}));
      });
    }
    const apiKeys = { ...((stored && stored.apiKeys) || {}) };
    const endpoints = { ...((stored && stored.endpoints) || {}) };
    const models = { ...((stored && stored.models) || {}) };

    const provider = (providerSelect.value || 'gemini').toLowerCase();
    const key = (apiKeyInput.value || '').trim();
    const endpoint = (endpointInput.value || '').trim();
    const model = (modelInput.value || '').trim();

    if (key) apiKeys[provider] = key;
    // For local provider, use "local" as default key if empty
    if (provider === 'local' && !key) {
      apiKeys[provider] = 'local';
    }
    if (endpoint) endpoints[provider] = endpoint;
    if (model) models[provider] = model;

    if (apiKeys[provider]) {
      apiKeys.default = apiKeys[provider];
      apiKeys.apiKey = apiKeys[provider];
    }

    return {
      enabled: enabledToggle.checked,
      mode: currentMode,
      provider,
      apiKeys,
      apiKey: apiKeys.gemini || apiKeys[provider] || '',
      endpoints,
      models
    };
  }

  function clearValidation() {
    apiKeyInput.classList.remove('input-invalid');
    endpointInput.classList.remove('input-invalid');
    modelInput.classList.remove('input-invalid');
  }

  function flashButton(el) {
    el.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.25)';
    setTimeout(() => (el.style.boxShadow = ''), 450);
  }

})();


