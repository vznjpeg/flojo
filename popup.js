// DOM Elements
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const statusBadge = document.getElementById('status');
const timerDisplay = document.getElementById('timer');
const downloadSection = document.getElementById('downloadSection');
const fileInfo = document.getElementById('fileInfo');

// Settings
const recordScreenCheckbox = document.getElementById('recordScreen');
const recordWebcamCheckbox = document.getElementById('recordWebcam');
const recordAudioCheckbox = document.getElementById('recordAudio');
const recordSystemAudioCheckbox = document.getElementById('recordSystemAudio');
const autoMinimizeCheckbox = document.getElementById('autoMinimize');
const qualitySelect = document.getElementById('quality');

// State
let recordingState = 'idle'; // idle, recording, paused
let timerInterval = null;
let recordingTime = 0;
let recordedBlob = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateButtonStates();
});

// Button Event Listeners
startBtn.addEventListener('click', startRecording);
pauseBtn.addEventListener('click', togglePause);
stopBtn.addEventListener('click', stopRecording);
resetBtn.addEventListener('click', resetRecording);
downloadBtn.addEventListener('click', downloadRecording);

// Settings Event Listeners
recordScreenCheckbox.addEventListener('change', saveSettings);
recordWebcamCheckbox.addEventListener('change', saveSettings);
recordAudioCheckbox.addEventListener('change', saveSettings);
recordSystemAudioCheckbox.addEventListener('change', saveSettings);
autoMinimizeCheckbox.addEventListener('change', saveSettings);
qualitySelect.addEventListener('change', saveSettings);

async function startRecording() {
  try {
    const constraints = {
      video: recordScreenCheckbox.checked
        ? {
            mandatory: {
              chromeMediaSource: 'screen',
              maxWidth: getQualityWidth(),
              maxHeight: getQualityHeight()
            }
          }
        : false,
      audio: recordSystemAudioCheckbox.checked
        ? {
            mandatory: {
              chromeMediaSource: 'system'
            }
          }
        : false
    };

    // Get screen stream
    let screenStream = null;
    if (recordScreenCheckbox.checked) {
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: getQualityWidth() },
            height: { ideal: getQualityHeight() },
            frameRate: { ideal: 30 }
          },
          audio: recordSystemAudioCheckbox.checked
        });
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          throw err;
        }
        alert('Screen recording permission denied');
        return;
      }
    }

    // Get webcam stream
    let webcamStream = null;
    if (recordWebcamCheckbox.checked) {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 320 } },
          audio: recordAudioCheckbox.checked
        });
      } catch (err) {
        if (err.name !== 'NotAllowedError') {
          throw err;
        }
        console.warn('Webcam permission denied');
      }
    }

    // Send to content script to start recording with overlay
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'startRecording',
          screenStream: screenStream ? 'active' : null,
          webcamStream: webcamStream ? 'active' : null,
          recordAudio: recordAudioCheckbox.checked,
          recordSystemAudio: recordSystemAudioCheckbox.checked,
          autoMinimize: autoMinimizeCheckbox.checked
        }, () => {
          recordingState = 'recording';
          updateStatus();
          updateButtonStates();
          startTimer();
          downloadSection.style.display = 'none';

          // Store streams for later use
          chrome.storage.local.set({
            screenStream,
            webcamStream,
            isRecording: true,
            recordingStartTime: Date.now()
          });
        });
      }
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    alert('Failed to start recording: ' + error.message);
  }
}

function togglePause() {
  if (recordingState === 'recording') {
    recordingState = 'paused';
  } else if (recordingState === 'paused') {
    recordingState = 'recording';
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'togglePause',
        isPaused: recordingState === 'paused'
      });
    }
  });

  if (recordingState === 'paused') {
    clearInterval(timerInterval);
  } else {
    startTimer();
  }

  updateStatus();
}

function stopRecording() {
  recordingState = 'idle';
  clearInterval(timerInterval);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'stopRecording'
      }, (response) => {
        if (response && response.recordingData) {
          recordedBlob = new Blob([response.recordingData], { type: 'video/webm' });
          downloadSection.style.display = 'block';
          fileInfo.textContent = `Recording size: ${(recordedBlob.size / 1024 / 1024).toFixed(2)} MB`;
        }
        updateStatus();
        updateButtonStates();
        resetTimer();
      });
    }
  });
}

function resetRecording() {
  recordingState = 'idle';
  recordedBlob = null;
  recordingTime = 0;
  clearInterval(timerInterval);

  chrome.storage.local.remove(['screenStream', 'webcamStream', 'isRecording', 'recordingStartTime']);

  updateStatus();
  updateButtonStates();
  resetTimer();
  downloadSection.style.display = 'none';
}

function downloadRecording() {
  if (!recordedBlob) return;

  const url = URL.createObjectURL(recordedBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flojo-recording-${new Date().getTime()}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    recordingTime++;
    updateTimerDisplay();
  }, 1000);
}

function resetTimer() {
  recordingTime = 0;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const hours = Math.floor(recordingTime / 3600);
  const minutes = Math.floor((recordingTime % 3600) / 60);
  const seconds = recordingTime % 60;

  timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateStatus() {
  if (recordingState === 'recording') {
    statusBadge.textContent = 'Recording';
    statusBadge.className = 'status-badge recording';
  } else if (recordingState === 'paused') {
    statusBadge.textContent = 'Paused';
    statusBadge.className = 'status-badge paused';
  } else {
    statusBadge.textContent = 'Not Recording';
    statusBadge.className = 'status-badge idle';
  }
}

function updateButtonStates() {
  const isRecording = recordingState !== 'idle';

  startBtn.disabled = isRecording;
  pauseBtn.disabled = !isRecording;
  stopBtn.disabled = !isRecording;
  resetBtn.disabled = !isRecording && recordingState !== 'paused';

  recordScreenCheckbox.disabled = isRecording;
  recordWebcamCheckbox.disabled = isRecording;
  recordAudioCheckbox.disabled = isRecording;
  recordSystemAudioCheckbox.disabled = isRecording;
  qualitySelect.disabled = isRecording;

  if (recordingState === 'paused') {
    pauseBtn.textContent = '▶ Resume';
  } else {
    pauseBtn.textContent = '⏸ Pause';
  }
}

function getQualityWidth() {
  const quality = qualitySelect.value;
  switch (quality) {
    case '1080': return 1920;
    case '720': return 1280;
    case '480': return 854;
    default: return 1280;
  }
}

function getQualityHeight() {
  const quality = qualitySelect.value;
  switch (quality) {
    case '1080': return 1080;
    case '720': return 720;
    case '480': return 480;
    default: return 720;
  }
}

function saveSettings() {
  chrome.storage.sync.set({
    recordScreen: recordScreenCheckbox.checked,
    recordWebcam: recordWebcamCheckbox.checked,
    recordAudio: recordAudioCheckbox.checked,
    recordSystemAudio: recordSystemAudioCheckbox.checked,
    autoMinimize: autoMinimizeCheckbox.checked,
    quality: qualitySelect.value
  });
}

function loadSettings() {
  chrome.storage.sync.get([
    'recordScreen',
    'recordWebcam',
    'recordAudio',
    'recordSystemAudio',
    'autoMinimize',
    'quality'
  ], (result) => {
    recordScreenCheckbox.checked = result.recordScreen !== false;
    recordWebcamCheckbox.checked = result.recordWebcam !== false;
    recordAudioCheckbox.checked = result.recordAudio !== false;
    recordSystemAudioCheckbox.checked = result.recordSystemAudio !== false;
    autoMinimizeCheckbox.checked = result.autoMinimize !== false;
    qualitySelect.value = result.quality || '720';
  });
}
