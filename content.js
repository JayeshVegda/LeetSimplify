// LeetSimplify Content Script
// Handles DOM manipulation and Gemini API integration
// Version: 1.0.1 - Updated to use gemini-2.5-flash

(function() {
  'use strict';

  // Configuration
  const DEFAULT_PROVIDER = 'gemini';
  const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
  const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

  // Two-mode system mapped to prompts.json keys
  const MODE_TO_PROMPT_KEY = {
    noHint: 'simplifyNoHint',
    withHint: 'simplifyWithHint'
  };

  const PROVIDER_LABELS = {
    gemini: 'Gemini',
    openai: 'ChatGPT',
    chatgpt: 'ChatGPT',
    anthropic: 'Claude',
    claude: 'Claude',
    cohere: 'Cohere',
    mistral: 'Mistral',
    local: 'Local (Ollama)'
  };

  const MODE_LABELS = {
    noHint: 'No Hint',
    withHint: 'With Hint'
  };

  // State
  let simplifyButton = null;
  let resultsContainer = null;
  let isProcessing = false;
  let lastRequest = null; // stores last request for Regenerate
  let initAttempts = 0;
  const MAX_INIT_ATTEMPTS = 20;

  // Debug logging
  function log(...args) {
    console.log('[LeetSimplify]', ...args);
  }

  function logError(...args) {
    console.error('[LeetSimplify]', ...args);
  }

  // Check if extension context is still valid
  function isExtensionContextValid() {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        return false;
      }
      // Try to access chrome.runtime.id - this will throw if context is invalidated
      const id = chrome.runtime.id;
      return typeof id !== 'undefined';
    } catch (err) {
      // Context invalidated - any error accessing chrome.runtime means invalid context
      return false;
    }
  }

  // Safely access chrome.storage with context invalidation handling
  async function safeStorageGet(keys) {
    if (!isExtensionContextValid()) {
      const error = new Error('Extension context invalidated. Please reload the page.');
      error.isContextInvalidated = true;
      throw error;
    }
    
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
      return {};
    }

    try {
      return await chrome.storage.sync.get(keys);
    } catch (err) {
      // Check if it's a context invalidation error (various error messages possible)
      const errorMsg = err.message || String(err);
      if (errorMsg.includes('Extension context invalidated') || 
          errorMsg.includes('message port closed') ||
          errorMsg.includes('Receiving end does not exist')) {
        const error = new Error('Extension context invalidated. Please reload the page.');
        error.isContextInvalidated = true;
        throw error;
      }
      throw err;
    }
  }

  // Safely get runtime URL
  function safeGetRuntimeURL(path) {
    if (!isExtensionContextValid()) {
      return './' + path; // Fallback to relative path
    }
    
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
      try {
        return chrome.runtime.getURL(path);
      } catch (err) {
        return './' + path; // Fallback to relative path
      }
    }
    
    return './' + path; // Fallback to relative path
  }

  function getProviderLabel(provider) {
    if (!provider) return 'Unknown';
    const key = provider.toLowerCase();
    return PROVIDER_LABELS[key] || provider;
  }

  function buildFullPrompt(basePrompt, problemText) {
    return `${basePrompt}\n\nProblem Description:\n${problemText}`;
  }

  // Check if we're on a LeetCode problem page
  function isProblemPage() {
    const path = window.location.pathname;
    // Match /problems/... with optional trailing slash or sub-routes
    return path.match(/^\/problems\/[^\/]+(\/.*)?$/);
  }

  // Initialize when DOM is ready
  function init() {
    if (isProblemPage()) {
      log('Initializing on problem page:', window.location.pathname);
      initAttempts = 0;
      waitForPageLoad();
    }
  }

  // Wait for LeetCode page to fully load
  function waitForPageLoad() {
    const checkInterval = setInterval(() => {
      initAttempts++;
      
      log(`Attempt ${initAttempts}: Looking for DOM elements...`);
      
      const problemContainer = findProblemContainer();
      log('Problem container found:', !!problemContainer);
      
      // Try multiple injection strategies
      let injected = false;
      
      // Strategy 1: Try to find button area near difficulty/topics
      const buttonArea = findButtonArea();
      if (buttonArea) {
        log('Button area found, attempting injection');
        injected = injectSimplifyButton(buttonArea);
      }
      
      // Strategy 2: Try to inject near problem title
      if (!injected) {
        const titleArea = findTitleArea();
        if (titleArea) {
          log('Title area found, attempting injection');
          injected = injectSimplifyButtonNearTitle(titleArea);
        }
      }
      
      // Strategy 3: Try to inject in description header
      if (!injected) {
        const descHeader = findDescriptionHeader();
        if (descHeader) {
          log('Description header found, attempting injection');
          injected = injectSimplifyButtonInHeader(descHeader);
        }
      }
      
      if (injected) {
        log('Button injection successful!');
        clearInterval(checkInterval);
        observePageChanges();
      } else if (initAttempts >= MAX_INIT_ATTEMPTS) {
        logError('Max attempts reached. Could not find suitable location for button.');
        clearInterval(checkInterval);
        // Keep trying in background with longer intervals
        const retryInterval = setInterval(() => {
          const buttonArea = findButtonArea();
          if (buttonArea && !document.getElementById('leetsimplify-btn')) {
            if (injectSimplifyButton(buttonArea)) {
              clearInterval(retryInterval);
              observePageChanges();
            }
          }
        }, 2000);
      }
    }, 500);
  }

  // Find the problem description container with improved selectors
  function findProblemContainer() {
    // Modern LeetCode selectors (2024)
    const modernSelectors = [
      '[data-track-load="description_content"]',
      '[data-track-load="qd_description_data"]',
      '.question-content__JfgR',
      '.content__u3I1',
      '._1l1MA', // LeetCode's main content area
      '[class*="question-content"]',
      '[class*="description"]',
      '.xFUwe',
      '.css-v3d350'
    ];

    for (const selector of modernSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        for (const element of elements) {
          const text = element.textContent || '';
          // Check if it's likely the problem description
          if (text.length > 200 && (
            text.includes('Example') || 
            text.includes('Input') || 
            text.includes('Output') ||
            text.includes('Constraints') ||
            text.match(/\d+\.\s+[A-Z]/) // Numbered problem statement
          )) {
            log('Found problem container with selector:', selector);
            return element;
          }
        }
      } catch (e) {
        // Skip invalid selectors
      }
    }

    // Fallback: Look for divs with substantial content
    const allDivs = document.querySelectorAll('div[class*="content"], div[class*="description"], div[class*="question"]');
    for (const div of allDivs) {
      const text = div.textContent.trim();
      if (text.length > 300) {
        // Check for problem-like content
        const hasExample = text.includes('Example') || text.includes('example');
        const hasInput = text.includes('Input') || text.includes('input');
        const hasConstraints = text.includes('Constraints') || text.includes('constraints');
        
        if (hasExample && hasInput) {
          log('Found problem container via fallback search');
          return div;
        }
      }
    }

    logError('Problem container not found');
    return null;
  }

  // Find area where difficulty/topic buttons are located
  function findButtonArea() {
    // Look for difficulty indicators - prioritize this heavily
    const difficultySelectors = [
      '[class*="difficulty"]',
      '[class*="text-difficulty"]',
      'button[class*="easy"]',
      'button[class*="medium"]',
      'button[class*="hard"]',
      'div[class*="difficulty"]',
      '[data-difficulty]',
      'span[class*="difficulty"]'
    ];

    for (const selector of difficultySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.toLowerCase();
        // Check if it's actually a difficulty indicator
        if (text.includes('easy') || text.includes('medium') || text.includes('hard') || 
            element.classList.toString().toLowerCase().includes('difficulty')) {
          // Try multiple parent levels to find the best container
          let parent = element.parentElement;
          for (let i = 0; i < 5 && parent; i++) {
            // Look for flex containers or containers with multiple buttons/tags
            if (parent.classList.contains('flex') || 
                window.getComputedStyle(parent).display === 'flex' ||
                parent.querySelectorAll('button, [class*="tag"], [class*="badge"], [class*="chip"]').length > 0) {
              log('Found button area via difficulty selector at level', i);
              return parent;
            }
            parent = parent.parentElement;
          }
          // Fallback: return closest flex container or parent
          parent = element.closest('div[class*="flex"], div[class*="button"], div[class*="tag"], div[class*="chip"]');
          if (parent) {
            log('Found button area via difficulty selector (fallback)');
            return parent;
          }
        }
      }
    }

    // Look for topic/company tags
    const tagSelectors = [
      '[class*="topic"]',
      '[class*="company"]',
      '[class*="tag"]',
      'button[class*="rounded"]'
    ];

    for (const selector of tagSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const text = element.textContent.toLowerCase();
        if (text.includes('topic') || text.includes('company') || text.includes('array') || text.includes('string')) {
          let parent = element.parentElement;
          // Go up a few levels to find the container
          for (let i = 0; i < 3 && parent; i++) {
            if (parent.querySelectorAll('button, [class*="tag"], [class*="badge"]').length > 1) {
              log('Found button area via tag selector');
              return parent;
            }
            parent = parent.parentElement;
          }
        }
      }
    }

    return null;
  }

  // Find title area
  function findTitleArea() {
    const titleSelectors = [
      'h1',
      '[data-cy="question-title"]',
      '[class*="title"]',
      '[class*="question-title"]',
      'a[href*="/problems/"]'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.trim();
        // LeetCode problem titles are usually short and don't contain "Example"
        if (text.length > 5 && text.length < 100 && !text.toLowerCase().includes('example')) {
          // Find parent that might contain buttons
          let parent = element.parentElement;
          for (let i = 0; i < 5 && parent; i++) {
            if (parent.querySelectorAll('button, [class*="flex"]').length > 0) {
              log('Found title area');
              return parent;
            }
            parent = parent.parentElement;
          }
          return element.parentElement;
        }
      }
    }

    return null;
  }

  // Find description header
  function findDescriptionHeader() {
    // Look for headers or toolbars above the description
    const headerSelectors = [
      '[class*="header"]',
      '[class*="toolbar"]',
      '[class*="actions"]',
      'div[class*="flex"][class*="justify-between"]',
      'div[class*="flex"][class*="items-center"]'
    ];

    for (const selector of headerSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // Check if it's near the problem content
        const problemContainer = findProblemContainer();
        if (problemContainer && element.contains(problemContainer)) {
          continue;
        }
        
        // Check if it has buttons or interactive elements
        if (element.querySelectorAll('button, [role="button"], [class*="button"]').length > 0) {
          log('Found description header');
          return element;
        }
      }
    }

    return null;
  }

  // Inject button in button area
  function injectSimplifyButton(container) {
    if (!container) return false;
    
    // Check if button already exists
    const existingBtn = document.getElementById('leetsimplify-btn');
    if (existingBtn) {
      // Button already exists, just update reference
      simplifyButton = existingBtn;
      return true;
    }

    try {
      // Create button
      const btn = createSimplifyButton();
      simplifyButton = btn;

      // Strategy 1: If container is a flex container, append directly (best for difficulty tag area)
      const isFlex = container.classList.contains('flex') || 
                     window.getComputedStyle(container).display === 'flex' ||
                     window.getComputedStyle(container).display === 'inline-flex';
      if (isFlex) {
        container.appendChild(btn);
        log('Button injected in flex container');
        return true;
      }

      // Strategy 2: Try to find a flex container within
      const flexContainer = container.querySelector('[class*="flex"], div[style*="display: flex"], div[style*="display:inline-flex"]');
      if (flexContainer) {
        flexContainer.appendChild(btn);
        log('Button injected in nested flex container');
        return true;
      }

      // Strategy 3: Try to insert after difficulty tag or existing buttons/tags
      const difficultyTag = container.querySelector('[class*="difficulty"], [data-difficulty]');
      if (difficultyTag && difficultyTag.parentElement) {
        difficultyTag.parentElement.insertBefore(btn, difficultyTag.nextSibling);
        log('Button injected after difficulty tag');
        return true;
      }

      // Strategy 4: Try to insert after existing buttons
      const existingButtons = container.querySelectorAll('button, [role="button"], [class*="tag"], [class*="chip"], [class*="badge"]');
      if (existingButtons.length > 0) {
        const lastElement = existingButtons[existingButtons.length - 1];
        if (lastElement.parentElement) {
          lastElement.parentElement.insertBefore(btn, lastElement.nextSibling);
          log('Button injected after existing buttons/tags');
          return true;
        }
      }

      // Strategy 5: Prefer inserting after the entire container to avoid merging with inline chips
      if (container.parentElement) {
        container.parentElement.insertBefore(btn, container.nextSibling);
        log('Button inserted after chip container');
        return true;
      }

      // Last resort: append to container
      container.appendChild(btn);
      log('Button appended to container');
      return true;
    } catch (e) {
      logError('Error injecting button:', e);
      return false;
    }
  }

  // Inject button near title
  function injectSimplifyButtonNearTitle(titleArea) {
    if (!titleArea) return false;
    
    if (document.getElementById('leetsimplify-btn')) {
      return true;
    }

    try {
      simplifyButton = createSimplifyButton();
      simplifyButton.style.marginTop = '10px';
      simplifyButton.style.marginBottom = '10px';
      
      // Insert after title area
      titleArea.parentElement.insertBefore(simplifyButton, titleArea.nextSibling);
      log('Button injected near title');
      return true;
    } catch (e) {
      logError('Error injecting button near title:', e);
      return false;
    }
  }

  // Inject button in header
  function injectSimplifyButtonInHeader(header) {
    if (!header) return false;
    
    if (document.getElementById('leetsimplify-btn')) {
      return true;
    }

    try {
      simplifyButton = createSimplifyButton();
      header.appendChild(simplifyButton);
      log('Button injected in header');
      return true;
    } catch (e) {
      logError('Error injecting button in header:', e);
      return false;
    }
  }

  // Create the Simplify button element
  function createSimplifyButton() {
    const button = document.createElement('button');
    button.id = 'leetsimplify-btn';
    button.className = 'leetsimplify-btn';
    button.textContent = '✨ Simplify';
    button.title = 'Simplify problem description with AI';
    button.addEventListener('click', handleSimplifyClick);
    return button;
  }


  // Handle Simplify button click
  async function handleSimplifyClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessing) {
      return;
    }

    log('Simplify button clicked');

    // Read mode from extension storage and run directly (no on-page prompt)
    try {
      const cfg = await safeStorageGet(['mode']);
      const mode = (cfg && cfg.mode) || 'noHint';
      await runGeneration(mode);
    } catch (err) {
      // Check if it's a context invalidation error
      if (err.isContextInvalidated || (err.message && err.message.includes('Extension context invalidated'))) {
        logError('Extension context invalidated', err);
        showError('Extension was reloaded. Please refresh this page to continue.');
        return;
      }
      logError('Failed to read mode from storage, defaulting to noHint', err);
      await runGeneration('noHint');
    }
  }

  async function runGeneration(mode) {
    if (isProcessing) return;

    // Load config (supports multi-provider) with safe fallback
    let config = {};
    try {
      config = await safeStorageGet(['enabled', 'provider', 'apiKey', 'apiKeys', 'endpoints', 'models']);
    } catch (err) {
      // Check if it's a context invalidation error
      if (err.isContextInvalidated || (err.message && err.message.includes('Extension context invalidated'))) {
        logError('Extension context invalidated', err);
        showError('Extension was reloaded. Please refresh this page to continue.');
        return;
      }
      logError('Failed to read config from storage, using defaults', err);
      config = {};
    }
    const enabled = config.enabled !== false;
    if (!enabled) {
      showError('LeetSimplify is turned off. Open the extension popup to turn it back on.');
      return;
    }

    const selectedProvider = (config.provider || DEFAULT_PROVIDER).toLowerCase();

    const mergedApiKeys = {
      ...(config.apiKeys || {})
    };
    if (config.apiKey && !mergedApiKeys.gemini) {
      mergedApiKeys.gemini = config.apiKey;
    }
    if (mergedApiKeys[selectedProvider] && !mergedApiKeys.default) {
      mergedApiKeys.default = mergedApiKeys[selectedProvider];
    }
    if (mergedApiKeys[selectedProvider] && !mergedApiKeys.apiKey) {
      mergedApiKeys.apiKey = mergedApiKeys[selectedProvider];
    }

    // Extract problem text
    const problemText = extractProblemText();
    if (!problemText) {
      showError('Could not find problem description. Please refresh the page.');
      return;
    }

    const promptKey = MODE_TO_PROMPT_KEY[mode] || MODE_TO_PROMPT_KEY.noHint;

    // Update UI
    setProcessingState(true);
    clearResults();

    try {
      let simplifiedText = null;
      if (window.LeetSimplifyProviders && typeof window.LeetSimplifyProviders.generateSimplifiedFromPromptKey === 'function') {
        simplifiedText = await window.LeetSimplifyProviders.generateSimplifiedFromPromptKey({
          provider: selectedProvider,
          promptKey,
          problemText,
          apiKeys: mergedApiKeys,
          endpoints: config.endpoints || {},
          models: config.models || {}
        });
      } else if (window.LeetSimplifyProviders && typeof window.LeetSimplifyProviders.getPromptByKey === 'function' && typeof window.LeetSimplifyProviders.generateSimplified === 'function') {
        const basePrompt = await window.LeetSimplifyProviders.getPromptByKey(promptKey);
        simplifiedText = await window.LeetSimplifyProviders.generateSimplified({
          provider: selectedProvider,
          basePrompt,
          problemText,
          apiKeys: mergedApiKeys,
          endpoints: config.endpoints || {},
          models: config.models || {}
        });
      } else {
        // Fallback to legacy Gemini flow with direct fetch of prompts.json
        const promptsUrl = safeGetRuntimeURL('prompts.json');
        const promptText = await fetch(promptsUrl).then(r => r.json()).then(j => j.prompts?.[promptKey] || j[promptKey]);
        if (!promptText) throw new Error('Prompt not found. Please reinstall or update the extension.');
        const fallbackKey = mergedApiKeys.gemini || mergedApiKeys.apiKey || mergedApiKeys.default;
        if (!fallbackKey) {
          showError('Please set your API key. Open the extension to configure it.');
          return;
        }
        simplifiedText = await callGeminiAPI({
          apiKey: fallbackKey,
          problemText,
          promptTemplate: promptText,
          endpoint: (config.endpoints && config.endpoints.gemini) || null,
          model: (config.models && config.models.gemini) || DEFAULT_GEMINI_MODEL
        });
      }

      // Save last request for Regenerate
      lastRequest = {
        mode,
        promptKey,
        provider: selectedProvider,
        problemText,
        apiKeys: mergedApiKeys,
        endpoints: config.endpoints || {},
        models: config.models || {}
      };

      displayResults(simplifiedText, { provider: selectedProvider, mode });
    } catch (error) {
      logError('Error simplifying problem:', error);
      showError(error.message || 'Failed to simplify problem. Please try again.');
    } finally {
      setProcessingState(false);
    }
  }

  // Extract problem description text with improved logic
  function extractProblemText() {
    const container = findProblemContainer();
    if (!container) {
      logError('Cannot extract text: problem container not found');
      return null;
    }

    // Clone to avoid modifying original
    const clone = container.cloneNode(true);
    
    // Remove interactive elements that might interfere
    const elementsToRemove = clone.querySelectorAll('button, input, select, textarea, [role="button"], [class*="button"]');
    elementsToRemove.forEach(el => el.remove());
    
    // Get text content
    let text = clone.textContent || clone.innerText || '';
    
    // Clean up whitespace but preserve structure
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Max 2 newlines
      .replace(/[ \t]+/g, ' ') // Multiple spaces to single
      .replace(/ \n/g, '\n') // Space before newline
      .replace(/\n /g, '\n') // Space after newline
      .trim();

    if (text.length < 100) {
      logError('Extracted text too short:', text.length);
      return null;
    }

    log('Text extracted successfully, length:', text.length);
    return text;
  }

  // Call Gemini API
  async function callGeminiAPI({ apiKey, problemText, promptTemplate, endpoint, model }) {
    const targetModel = model || DEFAULT_GEMINI_MODEL;
    const apiEndpoint = endpoint || `${GEMINI_API_BASE}/${targetModel}:generateContent`;
    const fullPrompt = buildFullPrompt(promptTemplate, problemText);

    log('Gemini endpoint:', apiEndpoint);
    log('Request payload size:', JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] }).length, 'bytes');

    const response = await fetch(`${apiEndpoint}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logError('Gemini API Error Response:', errorData);
      
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check your Gemini API key in the extension popup.');
      } else if (response.status === 404) {
        throw new Error(`Model not found. Please verify the Gemini model name. Current model: ${targetModel}`);
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 400) {
        const errorMsg = errorData.error?.message || 'Bad request. Please check your API key and request format.';
        throw new Error(errorMsg);
      } else {
        const errorMsg = errorData.error?.message || errorData.message || `API error: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }
    }

    const data = await response.json();
    log('Gemini API response received:', data);
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      logError('Invalid response structure:', data);
      throw new Error('Invalid response from API. The model may not have returned content.');
    }

    const text = data.candidates[0].content.parts[0].text;
    if (!text) {
      logError('No text in response:', data);
      throw new Error('The model returned an empty response. Please try again.');
    }

    return text;
  }

  // Display simplified results
  function displayResults(simplifiedText, meta = {}) {
    clearResults();

    const container = findProblemContainer();
    if (!container) {
      showError('Could not find problem container to display results.');
      return;
    }

    // Create results container
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'leetsimplify-results';
    resultsContainer.className = 'leetsimplify-results';
    
    const title = document.createElement('h3');
    title.className = 'leetsimplify-title';
    title.textContent = '✨ Simplified Description';
    
    const content = document.createElement('div');
    content.className = 'leetsimplify-content';
    content.innerHTML = formatText(simplifiedText);

    const metaBar = document.createElement('div');
    metaBar.className = 'leetsimplify-meta';

    if (meta.mode) {
      const modeChip = document.createElement('span');
      modeChip.className = 'leetsimplify-chip leetsimplify-chip--mode';
      modeChip.textContent = MODE_LABELS[meta.mode] || 'Mode';
      metaBar.appendChild(modeChip);
    }

    if (meta.provider) {
      const providerChip = document.createElement('span');
      providerChip.className = 'leetsimplify-chip leetsimplify-chip--provider';
      providerChip.textContent = `${getProviderLabel(meta.provider)} API`;
      metaBar.appendChild(providerChip);
    }

    const regenerateBtn = document.createElement('button');
    regenerateBtn.className = 'leetsimplify-regenerate';
    regenerateBtn.type = 'button';
    regenerateBtn.innerHTML = '<span>↻</span> Regenerate';
    regenerateBtn.title = 'Regenerate the last response';
    regenerateBtn.setAttribute('aria-label', 'Regenerate the last response');
    regenerateBtn.addEventListener('click', async () => {
      if (!lastRequest) {
        showError('Nothing to regenerate yet. Please run a simplification first.');
        return;
      }
      regenerateBtn.disabled = true;
      try {
        await runGeneration(lastRequest.mode || 'noHint');
      } finally {
        regenerateBtn.disabled = false;
      }
    });
    metaBar.appendChild(regenerateBtn);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'leetsimplify-close';
    closeBtn.textContent = '×';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', () => {
      if (resultsContainer) {
        resultsContainer.remove();
        resultsContainer = null;
      }
    });

    resultsContainer.appendChild(closeBtn);
    resultsContainer.appendChild(title);
    resultsContainer.appendChild(metaBar);
    resultsContainer.appendChild(content);

    // Insert after problem container
    if (container.parentNode) {
      container.parentNode.insertBefore(resultsContainer, container.nextSibling);
    } else {
      container.appendChild(resultsContainer);
    }
    
    // Scroll to results
    setTimeout(() => {
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    log('Results displayed');
  }

  // Format text with basic markdown-like formatting
  function formatText(text) {
    if (!text) return '';

    // Basic markdown replacements (order matters)
    const escapeHtml = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Split content into blocks by double newlines
    const blocks = text.split(/\n{2,}/).map(b => b.trim()).filter(Boolean);

    const html = blocks.map(block => {
      // If block looks like a list (ordered or unordered), format as list
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const isOrdered = lines.every(l => /^\d+\.\s+/.test(l));
      const isUnordered = lines.every(l => /^[-*]\s+/.test(l));

      if (isOrdered || isUnordered) {
        const items = lines.map(line => {
          const content = line.replace(isOrdered ? /^\d+\.\s+/ : /^[-*]\s+/, '');
          return `<li>${inlineMarkdown(content)}</li>`;
        }).join('');
        return isOrdered ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
      }

      // Otherwise, treat as paragraph with inline markdown
      return `<p>${inlineMarkdown(block)}</p>`;
    }).join('');

    return html;

    function inlineMarkdown(s) {
      // Escape HTML first to avoid injection
      let out = escapeHtml(s);
      // Inline code `code`
      out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
      // Bold **text**
      out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic *text* (avoid conflict with bold already processed)
      out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');
      // Preserve single newlines inside paragraphs as <br>
      out = out.replace(/\n/g, '<br>');
      return out;
    }
  }

  // Show error message
  function showError(message) {
    clearResults();

    const container = findProblemContainer() || document.body;
    
    resultsContainer = document.createElement('div');
    resultsContainer.id = 'leetsimplify-error';
    resultsContainer.className = 'leetsimplify-error';
    resultsContainer.innerHTML = `<strong>Error:</strong> ${message}`;

    if (container.parentNode) {
      container.parentNode.insertBefore(resultsContainer, container.nextSibling);
    } else {
      container.appendChild(resultsContainer);
    }
    
    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (resultsContainer && resultsContainer.parentNode) {
        resultsContainer.remove();
      }
    }, 8000);
    
    logError('Error shown:', message);
  }

  // Clear results
  function clearResults() {
    const existing = document.getElementById('leetsimplify-results');
    if (existing) existing.remove();
    
    const error = document.getElementById('leetsimplify-error');
    if (error) error.remove();
    
    resultsContainer = null;
  }

  // Set processing state
  function setProcessingState(processing) {
    isProcessing = processing;
    const btn = document.getElementById('leetsimplify-btn');
    if (btn) {
      btn.disabled = processing;
      btn.textContent = processing ? '⏳ Simplifying...' : '✨ Simplify';
    }
  }

  // Observe page changes (for SPA navigation)
  function observePageChanges() {
    // Remove old observer if exists
    if (window.leetsimplifyObserver) {
      window.leetsimplifyObserver.disconnect();
    }

    window.leetsimplifyObserver = new MutationObserver((mutations) => {
      // Check if button still exists and we're still on a problem page
      if (isProblemPage() && !document.getElementById('leetsimplify-btn')) {
        log('Button removed, re-injecting...');
        setTimeout(() => {
          if (isProblemPage()) {
            init();
          }
        }, 1000);
      }
    });

    window.leetsimplifyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-initialize on navigation (for SPAs)
  let lastUrl = location.href;
  const urlObserver = new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      log('URL changed to:', url);
      
      // Clear existing buttons
      const oldBtn = document.getElementById('leetsimplify-btn');
      if (oldBtn) oldBtn.remove();
      simplifyButton = null;
      clearResults();
      
      // Re-initialize if on problem page
      if (isProblemPage()) {
        setTimeout(init, 1500);
      }
    }
  });

  urlObserver.observe(document, { subtree: true, childList: true });

  // Log startup info
  log('LeetSimplify content script loaded');
  log('Default Gemini model:', DEFAULT_GEMINI_MODEL);
  log('Default Gemini endpoint:', `${GEMINI_API_BASE}/${DEFAULT_GEMINI_MODEL}:generateContent`);

})();
