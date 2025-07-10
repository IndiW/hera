const BLOCKED_DOMAINS = ['lichess.org', 'youtube.com', 'reddit.com']
const MESSAGES = ['Why are you here?', 'Do you really want to do this?', 'What should you be doing?', 'How do you feel?']
const COOLDOWN_KEY = 'hera_cooldown_until';
const COOLDOWN_MINUTES = 5;

console.log('hera')
console.log(window.location.href)

function showCooldownTimer(cooldownUntil) {
  // Remove any existing cooldown timer
  const existing = document.getElementById('hera-cooldown-timer');
  if (existing) existing.remove();

  const timerDiv = document.createElement('div');
  timerDiv.id = 'hera-cooldown-timer';
  timerDiv.style.position = 'fixed';
  timerDiv.style.top = '20px';
  timerDiv.style.right = '20px';
  timerDiv.style.background = 'rgba(0,0,0,0.85)';
  timerDiv.style.color = 'white';
  timerDiv.style.padding = '12px 20px';
  timerDiv.style.borderRadius = '10px';
  timerDiv.style.fontSize = '20px';
  timerDiv.style.fontWeight = 'bold';
  timerDiv.style.zIndex = '10000';
  timerDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
  document.body.appendChild(timerDiv);

  function update() {
    const now = Date.now();
    const msLeft = cooldownUntil - now;
    if (msLeft > 0) {
      const secLeft = Math.floor(msLeft / 1000);
      const min = Math.floor(secLeft / 60).toString().padStart(2, '0');
      const sec = (secLeft % 60).toString().padStart(2, '0');
      timerDiv.textContent = `Cooldown: ${min}:${sec}`;
      timerDiv.style.display = 'block';
      setTimeout(update, 1000);
    } else {
      timerDiv.remove();
    }
  }
  update();
}

// Check cooldown
const cooldownUntil = localStorage.getItem(COOLDOWN_KEY);
if (cooldownUntil && Date.now() < parseInt(cooldownUntil, 10)) {
  const end = parseInt(cooldownUntil, 10);
  function logCooldown() {
    const now = Date.now();
    const msLeft = end - now;
    if (msLeft > 0) {
      const secLeft = Math.floor(msLeft / 1000);
      const min = Math.floor(secLeft / 60).toString().padStart(2, '0');
      const sec = (secLeft % 60).toString().padStart(2, '0');
      console.log(`Hera overlay is on cooldown. Time remaining: ${min}:${sec} | Ends at: ${new Date(end).toLocaleTimeString()}`);
      setTimeout(logCooldown, 5000);
    } else {
      console.log('Hera overlay cooldown ended.');
    }
  }
  logCooldown();
  // Show cooldown timer in top right
  showCooldownTimer(end);
} else {
  for (const domain of BLOCKED_DOMAINS) {
      if (window.location.href.includes(domain)) {
        addOverlay()
        break;
      }
  }
}

function createMessageText(overlay) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  messageDiv.style.fontSize = '4rem';
  messageDiv.style.fontWeight = 'bold';
  messageDiv.style.marginBottom = '10px';
  overlay.appendChild(messageDiv);
  return messageDiv;
}

function createInputField(overlay) {
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type your thoughts here...';
  input.style.marginTop = '20px';
  input.style.padding = '10px';
  input.style.fontSize = '18px';
  input.style.borderRadius = '6px';
  input.style.border = '1px solid #ccc';
  input.style.width = '80%';
  input.style.maxWidth = '400px';
  input.style.boxSizing = 'border-box';
  overlay.appendChild(input);
  return input;
}

function createEmojiRow(overlay, labelText, emojis, onSelect) {
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.flexDirection = 'row';
  row.style.justifyContent = 'center';
  row.style.alignItems = 'center';
  row.style.marginTop = '20px';
  row.style.gap = '10px';

  const label = document.createElement('span');
  label.textContent = labelText;
  label.style.marginRight = '10px';
  row.appendChild(label);

  let selected = null;
  emojis.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.textContent = item.emoji;
    btn.style.fontSize = '28px';
    btn.style.margin = '0 5px';
    btn.style.background = 'none';
    btn.style.border = '2px solid white';
    btn.style.borderRadius = '8px';
    btn.style.cursor = 'pointer';
    btn.style.outline = 'none';
    btn.setAttribute('aria-label', item.label);
    btn.addEventListener('click', () => {
      if (selected !== idx) {
        selected = idx;
        row.querySelectorAll('button').forEach(b => b.style.background = 'none');
        btn.style.background = 'rgba(55,255,255,0.5)';
        onSelect(idx, item.label);
      }
    });
    row.appendChild(btn);
  });
  overlay.appendChild(row);
  return {
    getSelected: () => selected,
    getSelectedLabel: () => selected !== null ? emojis[selected].label : 'None',
  };
}

function createSubmitButton(overlay, getInput, getEnergy, getPleasant, onSubmit) {
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit';
  submitBtn.style.marginTop = '20px';
  submitBtn.style.marginBottom = '20px';
  submitBtn.style.padding = '0 24px';
  submitBtn.style.fontSize = '18px';
  submitBtn.style.borderRadius = '6px';
  submitBtn.style.border = 'none';
  submitBtn.style.background = '#2196f3';
  submitBtn.style.color = 'white';
  submitBtn.style.cursor = 'pointer';
  submitBtn.style.fontWeight = 'bold';
  submitBtn.disabled = false;
  let submitted = false;
  submitBtn.addEventListener('click', () => {
    if (submitted) return;
    submitted = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitted';
    submitBtn.style.background = '#888';
    submitBtn.style.cursor = 'not-allowed';
    onSubmit(getInput(), getEnergy(), getPleasant());
  });
  overlay.appendChild(submitBtn);
  return submitBtn;
}

function createTimer(overlay, timeLeft, onTimeUp, getEndTime) {
  const timer = document.createElement('div');
  timer.style.marginTop = '0px';
  timer.style.fontSize = '32px';
  let t = timeLeft;
  const endTime = getEndTime();
  timer.textContent = formatTimerText(t, endTime);
  overlay.appendChild(timer);
  return { timer, start: (procrastinateBtn, submitBtn) => {
    const interval = setInterval(() => {
      t--;
      timer.textContent = formatTimerText(t, endTime);
      if (t <= 0) {
        clearInterval(interval);
        procrastinateBtn.style.display = 'block';
        timer.textContent = 'Time is up!';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Time Expired';
          submitBtn.style.background = '#888';
          submitBtn.style.cursor = 'not-allowed';
        }
        onTimeUp();
      }
    }, 1000);
    return interval;
  }};
}

function createProcrastinateButton(overlay, onProcrastinate) {
  const procrastinateBtn = document.createElement('button');
  procrastinateBtn.textContent = 'Procrastinate';
  procrastinateBtn.style.marginTop = '20px';
  procrastinateBtn.style.padding = '0 24px';
  procrastinateBtn.style.fontSize = '18px';
  procrastinateBtn.style.borderRadius = '6px';
  procrastinateBtn.style.border = 'none';
  procrastinateBtn.style.background = '#f44336';
  procrastinateBtn.style.color = 'white';
  procrastinateBtn.style.cursor = 'pointer';
  procrastinateBtn.style.fontWeight = 'bold';
  procrastinateBtn.style.display = 'none';
  procrastinateBtn.addEventListener('click', onProcrastinate);
  overlay.appendChild(procrastinateBtn);
  return procrastinateBtn;
}

function addOverlay() {
  // Remove any existing overlay first
  const existing = document.getElementById('hera-block-overlay');
  if (existing) {
    console.log('Removing existing overlay before adding new one');
    existing.remove();
  }

  // Wait for document.body if not ready
  if (!document.body) {
    console.log('document.body not ready, retrying...');
    setTimeout(addOverlay, 100);
    return;
  }

  // Determine timer duration
  let timeLeft;
  const cooldownUntil = localStorage.getItem(COOLDOWN_KEY);
  const now = Date.now();
  if (cooldownUntil && now < parseInt(cooldownUntil, 10)) {
    timeLeft = Math.ceil((parseInt(cooldownUntil, 10) - now) / 1000);
    console.log(`[hera] Cooldown active, overlay timer set to remaining: ${timeLeft} seconds`);
  } else {
    timeLeft = 120;
    console.log('[hera] No cooldown, overlay timer set to 2 minutes');
  }

  const overlay = document.createElement('div');
  overlay.id = 'hera-block-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(251,251,251,0.98)'; // Acorn bg
  overlay.style.zIndex = '9999';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.color = '#202124'; // Acorn text
  overlay.style.fontSize = '20px';
  overlay.style.fontWeight = 'bold';
  overlay.style.textAlign = 'center';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  overlay.style.borderRadius = '12px';
  overlay.style.boxShadow = '0 4px 32px rgba(0,0,0,0.18)';
  overlay.style.border = '1.5px solid #e0e0e0';
  overlay.style.padding = '32px 16px 24px 16px';

  // Add Acorn/Photon style to all buttons and inputs created after this point
  const origCreateElement = document.createElement.bind(document);
  document.createElement = function(tag) {
    const el = origCreateElement(tag);
    if (tag === 'button') {
      el.style.transition = 'background 0.2s, color 0.2s, border 0.2s';
      el.style.fontFamily = overlay.style.fontFamily;
      el.addEventListener('focus', () => {
        el.style.outline = '2px solid #0060df';
        el.style.outlineOffset = '2px';
      });
      el.addEventListener('blur', () => {
        el.style.outline = 'none';
      });
      el.addEventListener('mouseover', () => {
        if (!el.disabled) el.style.filter = 'brightness(0.95)';
      });
      el.addEventListener('mouseout', () => {
        el.style.filter = '';
      });
    }
    if (tag === 'input') {
      el.style.fontFamily = overlay.style.fontFamily;
      el.style.transition = 'border 0.2s, box-shadow 0.2s';
      el.addEventListener('focus', () => {
        el.style.border = '2px solid #0060df';
        el.style.boxShadow = '0 0 0 2px #b5d3fa';
      });
      el.addEventListener('blur', () => {
        el.style.border = '1px solid #ccc';
        el.style.boxShadow = 'none';
      });
    }
    return el;
  };

  createMessageText(overlay);
  const input = createInputField(overlay);

  const energyEmojis = [
    { label: 'Low', emoji: '😴' },
    { label: 'Medium', emoji: '😐' },
    { label: 'High', emoji: '⚡' }
  ];
  let energyLabel = 'None';
  const energyRow = createEmojiRow(overlay, 'Energy Level:', energyEmojis, (idx, label) => {
    energyLabel = label;
    console.log('Energy Level:', label);
  });

  const pleasantEmojis = [
    { label: 'Low', emoji: '😞' },
    { label: 'Medium', emoji: '😐' },
    { label: 'High', emoji: '😊' }
  ];
  let pleasantLabel = 'None';
  const pleasantRow = createEmojiRow(overlay, 'Pleasantness:', pleasantEmojis, (idx, label) => {
    pleasantLabel = label;
    console.log('Pleasantness:', label);
  });

  let interval;
  const submitBtn = createSubmitButton(
    overlay,
    () => input.value,
    () => energyLabel,
    () => pleasantLabel,
    (text, energy, pleasantness) => {
      const logEntry = {
        text,
        energy,
        pleasantness,
        timestamp: Date.now(),
        url: window.location.href
      };
      saveLogEntry(logEntry);
      const cooldownUntil = Date.now() + COOLDOWN_MINUTES * 60 * 1000;
      localStorage.setItem(COOLDOWN_KEY, cooldownUntil.toString());
    }
  );

  const procrastinateBtn = createProcrastinateButton(overlay, () => {
    const logEntry = {
      text: input.value,
      energy: energyLabel,
      pleasantness: pleasantLabel,
      timestamp: Date.now(),
      url: window.location.href
    };
    saveLogEntry(logEntry);
    const cooldownUntil = Date.now() + COOLDOWN_MINUTES * 60 * 1000;
    localStorage.setItem(COOLDOWN_KEY, cooldownUntil.toString());
    overlay.remove();
    clearInterval(interval);
    console.log('[hera] Procrastinate button clicked. Entry logged, overlay removed, and cooldown set.');
  });

  const timerObj = createTimer(
    overlay,
    timeLeft,
    () => {
      procrastinateBtn.style.display = 'block';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Time Expired';
        submitBtn.style.background = '#888';
        submitBtn.style.cursor = 'not-allowed';
      }
      console.log('[hera] Timer ended. Procrastinate button shown.');
    },
    () => Date.now() + timeLeft * 1000
  );
  interval = timerObj.start(procrastinateBtn, submitBtn);

  document.body.appendChild(overlay);
  // Restore document.createElement to original after overlay is created
  document.createElement = origCreateElement;
}

function saveLogEntry(logEntry) {
  try {
    const storage = (typeof browser !== 'undefined' && browser.storage && browser.storage.local)
      ? browser.storage.local
      : (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local)
        ? chrome.storage.local
        : null;

    if (!storage) {
      console.error('[hera] No storage API available. Log entry not saved.', logEntry);
      return;
    }

    // Use the Promise API if available (browser), otherwise callback (chrome)
    if (storage.get.length === 1) {
      // Promise API (browser)
      storage.get('hera_log').then((result) => {
        const log = Array.isArray(result.hera_log) ? result.hera_log : [];
        log.push(logEntry);
        storage.set({ hera_log: log }).catch((err) => {
          console.error('[hera] Error saving log entry with browser.storage.local.set:', err, logEntry);
        });
      }).catch((err) => {
        console.error('[hera] Error reading log with browser.storage.local.get:', err, logEntry);
      });
    } else {
      // Callback API (chrome)
      storage.get('hera_log', (result) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.error('[hera] Error reading log with chrome.storage.local.get:', chrome.runtime.lastError, logEntry);
          return;
        }
        const log = Array.isArray(result.hera_log) ? result.hera_log : [];
        log.push(logEntry);
        storage.set({ hera_log: log }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            console.error('[hera] Error saving log entry with chrome.storage.local.set:', chrome.runtime.lastError, logEntry);
          }
        });
      });
    }
  } catch (e) {
    console.error('[hera] Unexpected error in saveLogEntry:', e, logEntry);
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatTimerText(timeLeft, endTime) {
  return `Time left: ${formatTime(timeLeft)} | Ends at: ${formatEndTime(endTime)}`;
}

function formatEndTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString();
}