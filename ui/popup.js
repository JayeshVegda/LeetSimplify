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

  const enabledToggle = document.getElementById('enabledToggle');
  const segButtons = Array.from(document.querySelectorAll('.seg-btn'));
  const providerSelect = document.getElementById('providerSelect');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiKeyLabel = document.getElementById('apiKeyLabel');
  const apiKeyHint = document.getElementById('apiKeyHint');
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
    segButtons.forEach(btn => {
      btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    providerSelect.addEventListener('change', () => {
      updateApiLabel();
      updateLocalFields();
      loadProviderKey(providerSelect.value);
    });

    saveBtn.addEventListener('click', handleSave);
    resetBtn.addEventListener('click', handleReset);
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
      btn.setAttribute('aria-selected', String(isActive));
    });
  }

  function updateApiLabel() {
    const id = (providerSelect.value || 'gemini').toLowerCase();
    const name = providerNames[id] || 'Provider';
    const cleanName = name.replace(/\(.+\)/, '').trim();
    apiKeyLabel.textContent = `${cleanName} API Key`;
    apiKeyInput.placeholder = id === 'local' ? 'Optional (use "local" or leave empty)' : `Paste ${cleanName} API key`;
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
    const cfg = await gatherFormData();
    // For local provider, API key is optional, but endpoint and model are required
    if (cfg.enabled) {
      if (cfg.provider === 'local') {
        if (!cfg.endpoints.local || !cfg.models.local) {
          flashButton(saveBtn);
          return;
        }
      } else if (!(cfg.apiKeys[cfg.provider] || cfg.apiKeys.default)) {
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
      setTimeout(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Settings';
      }, 900);
    } catch {
      saveBtn.textContent = 'Retry Save';
      setTimeout(() => (saveBtn.textContent = 'Save Settings'), 1400);
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

  function flashButton(el) {
    el.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.25)';
    setTimeout(() => (el.style.boxShadow = ''), 450);
  }

})();


