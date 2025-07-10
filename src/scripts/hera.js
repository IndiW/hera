const BLOCKED_DOMAINS = ['lichess.org', 'youtube.com', 'reddit.com']
const MESSAGES = ['Why are you here?', 'Do you really want to do this?', 'What should you be doing?', 'How do you feel?']
const COOLDOWN_KEY = 'hera_cooldown_until';
const COOLDOWN_MINUTES = 5;

console.log('hera')
console.log(window.location.href)

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
    } else {
      console.log('Hera overlay cooldown ended.');
    }
  }
  logCooldown();
} else {
  for (const domain of BLOCKED_DOMAINS) {
      if (window.location.href.includes(domain)) {
        addOverlay()
        break;
      }
  }
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
    // Cooldown is active, show overlay with remaining time
    timeLeft = Math.ceil((parseInt(cooldownUntil, 10) - now) / 1000);
    console.log(`[hera] Cooldown active, overlay timer set to remaining: ${timeLeft} seconds`);
  } else {
    // No cooldown, show full timer
    timeLeft = 120; // 2 minutes in seconds
    console.log('[hera] No cooldown, overlay timer set to 2 minutes');
  }

  const overlay = document.createElement('div');
  overlay.id = 'hera-block-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 1)';
  overlay.style.zIndex = '9999';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.color = 'white';
  overlay.style.fontSize = '20px';
  overlay.style.fontWeight = 'bold';
  overlay.style.textAlign = 'center';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';

  const text = document.createTextNode(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
  overlay.appendChild(text);

  // Text input field
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

  // Energy Level Row - todo refactor into own function
  const energyRow = document.createElement('div');
  energyRow.style.display = 'flex';
  energyRow.style.flexDirection = 'row';
  energyRow.style.justifyContent = 'center';
  energyRow.style.alignItems = 'center';
  energyRow.style.marginTop = '30px';
  energyRow.style.gap = '10px';

  const energyLabel = document.createElement('span');
  energyLabel.textContent = 'Energy Level:';
  energyLabel.style.marginRight = '10px';
  energyRow.appendChild(energyLabel);

  const energyEmojis = [
    { label: 'Low', emoji: '😴' },
    { label: 'Medium', emoji: '😐' },
    { label: 'High', emoji: '⚡' }
  ];
  let selectedEnergy = null;
  energyEmojis.forEach((item, idx) => {
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
      if (selectedEnergy !== idx) {
        selectedEnergy = idx;
        // Deselect all
        energyRow.querySelectorAll('button').forEach(b => b.style.background = 'none');
        // Select this
        btn.style.background = 'rgba(55,255,255,0.5)';
        console.log('Energy Level:', item.label);
      }
    });
    energyRow.appendChild(btn);
  });
  overlay.appendChild(energyRow);

  // Pleasantness Row
  const pleasantRow = document.createElement('div');
  pleasantRow.style.display = 'flex';
  pleasantRow.style.flexDirection = 'row';
  pleasantRow.style.justifyContent = 'center';
  pleasantRow.style.alignItems = 'center';
  pleasantRow.style.marginTop = '20px';
  pleasantRow.style.gap = '10px';

  const pleasantLabel = document.createElement('span');
  pleasantLabel.textContent = 'Pleasantness:';
  pleasantLabel.style.marginRight = '10px';
  pleasantRow.appendChild(pleasantLabel);

  const pleasantEmojis = [
    { label: 'Low', emoji: '😞' },
    { label: 'Medium', emoji: '😐' },
    { label: 'High', emoji: '😊' }
  ];
  let selectedPleasant = null;
  pleasantEmojis.forEach((item, idx) => {
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
      if (selectedPleasant !== idx) {
        selectedPleasant = idx;
        // Deselect all
        pleasantRow.querySelectorAll('button').forEach(b => b.style.background = 'none');
        // Select this
        btn.style.background = 'rgba(55,255,255,0.5)';
        console.log('Pleasantness:', item.label);
      }
    });
    pleasantRow.appendChild(btn);
  });
  overlay.appendChild(pleasantRow);

  // Timer
  const timer = document.createElement('div');
  timer.style.marginTop = '20px';
  timer.style.fontSize = '32px';
  const endTime = Date.now() + timeLeft * 1000;
  timer.textContent = formatTimerText(timeLeft, endTime);
  overlay.appendChild(timer);

  document.body.appendChild(overlay);

  const interval = setInterval(() => {
    timeLeft--;
    timer.textContent = formatTimerText(timeLeft, endTime);
    if (timeLeft <= 0) {
      console.log('time up, removing overlay');
      clearInterval(interval);
      // Log the input value, energy, pleasantness, and url
      const energyValue = selectedEnergy !== null ? energyEmojis[selectedEnergy].label : 'None';
      const pleasantValue = selectedPleasant !== null ? pleasantEmojis[selectedPleasant].label : 'None';
      const logEntry = {
        text: input.value,
        energy: energyValue,
        pleasantness: pleasantValue,
        timestamp: Date.now(),
        url: window.location.href
      };
      saveLogEntry(logEntry);
      // Set cooldown for 5 minutes
      const cooldownUntil = Date.now() + COOLDOWN_MINUTES * 60 * 1000;
      localStorage.setItem(COOLDOWN_KEY, cooldownUntil.toString());
      overlay.remove();
    }
  }, 1000);
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