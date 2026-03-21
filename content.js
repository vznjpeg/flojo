// Content script - runs on the webpage to handle recording overlay

let mediaRecorder = null;
let recordedChunks = [];
let screenStream = null;
let webcamStream = null;
let isRecording = false;
let isPaused = false;
let overlayContainer = null;
let canvas = null;
let canvasContext = null;
let animationFrameId = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startRecording') {
    startRecording(request).then(() => {
      sendResponse({ status: 'recording started' });
    }).catch((error) => {
      sendResponse({ error: error.message });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'togglePause') {
    togglePause(request.isPaused);
    sendResponse({ status: 'pause toggled' });
  }

  if (request.action === 'stopRecording') {
    stopRecording().then((blob) => {
      sendResponse({ status: 'recording stopped', recordingData: blob });
    }).catch((error) => {
      sendResponse({ error: error.message });
    });
    return true;
  }
});

async function startRecording(options) {
  try {
    // Get display media (screen)
    const displayMediaOptions = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: options.recordSystemAudio ? { echoCancellation: false } : false
    };

    try {
      screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    } catch (err) {
      console.error('Failed to get screen:', err);
      if (err.name === 'NotAllowedError') {
        throw new Error('Screen recording was cancelled');
      }
    }

    // Get webcam
    let webcamTrack = null;
    if (options.webcamStream) {
      try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 320 } },
          audio: options.recordAudio
        });
        webcamTrack = webcamStream.getVideoTracks()[0];
      } catch (err) {
        console.warn('Webcam unavailable:', err);
        webcamStream = null;
      }
    }

    // Create canvas to composite streams
    canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    canvasContext = canvas.getContext('2d');

    // Get all audio tracks
    const audioTracks = [];
    if (screenStream && screenStream.getAudioTracks().length > 0) {
      audioTracks.push(...screenStream.getAudioTracks());
    }
    if (webcamStream && webcamStream.getAudioTracks().length > 0) {
      audioTracks.push(...webcamStream.getAudioTracks());
    }

    // Create video track from canvas
    const canvasStream = canvas.captureStream(30);
    const videoTracks = canvasStream.getVideoTracks();

    // Combine audio tracks
    const audioContext = new AudioContext();
    const audioDestination = audioContext.createMediaStreamDestination();

    if (audioTracks.length > 0) {
      audioTracks.forEach(track => {
        const source = audioContext.createMediaStreamSource(new MediaStream([track]));
        source.connect(audioDestination);
      });
    }

    // Create final stream with composite video and mixed audio
    const finalStream = new MediaStream();
    if (videoTracks.length > 0) {
      finalStream.addTrack(videoTracks[0]);
    }
    audioDestination.stream.getAudioTracks().forEach(track => {
      finalStream.addTrack(track);
    });

    // Start compositing
    startCompositing(screenStream, webcamStream);

    // Create and start media recorder
    mediaRecorder = new MediaRecorder(finalStream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000
    });

    recordedChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.start(100);
    isRecording = true;
    isPaused = false;

    // Create and show overlay
    createOverlay(options.autoMinimize);

    // Keep screen awake
    keepScreenAwake();

  } catch (error) {
    console.error('Recording error:', error);
    throw error;
  }
}

function startCompositing(screenStream, webcamStream) {
  const screenVideo = document.createElement('video');
  screenVideo.srcObject = screenStream;
  screenVideo.play();

  let webcamVideo = null;
  if (webcamStream) {
    webcamVideo = document.createElement('video');
    webcamVideo.srcObject = webcamStream;
    webcamVideo.play();
  }

  const draw = () => {
    if (!isRecording) {
      cancelAnimationFrame(animationFrameId);
      return;
    }

    try {
      // Draw screen
      if (screenVideo.readyState === screenVideo.HAVE_ENOUGH_DATA) {
        canvasContext.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
      }

      // Draw webcam as circle (PiP) in bottom right
      if (webcamVideo && webcamVideo.readyState === webcamVideo.HAVE_ENOUGH_DATA) {
        const circleSize = 150;
        const padding = 20;
        const x = canvas.width - circleSize - padding;
        const y = canvas.height - circleSize - padding;

        // Create circular clip
        canvasContext.save();
        canvasContext.beginPath();
        canvasContext.arc(x + circleSize / 2, y + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        canvasContext.clip();

        // Draw video inside circle
        const videoAspectRatio = webcamVideo.videoWidth / webcamVideo.videoHeight;
        let drawWidth = circleSize;
        let drawHeight = circleSize / videoAspectRatio;

        if (drawHeight < circleSize) {
          drawHeight = circleSize;
          drawWidth = circleSize * videoAspectRatio;
        }

        const offsetX = x + (circleSize - drawWidth) / 2;
        const offsetY = y + (circleSize - drawHeight) / 2;

        canvasContext.drawImage(webcamVideo, offsetX, offsetY, drawWidth, drawHeight);
        canvasContext.restore();

        // Draw circle border
        canvasContext.strokeStyle = '#ffffff';
        canvasContext.lineWidth = 3;
        canvasContext.beginPath();
        canvasContext.arc(x + circleSize / 2, y + circleSize / 2, circleSize / 2, 0, Math.PI * 2);
        canvasContext.stroke();
      }
    } catch (e) {
      console.error('Compositing error:', e);
    }

    animationFrameId = requestAnimationFrame(draw);
  };

  animationFrameId = requestAnimationFrame(draw);
}

function togglePause(paused) {
  if (paused) {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
    }
    isPaused = true;
  } else {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
    }
    isPaused = false;
  }

  updateOverlayStatus();
}

async function stopRecording() {
  return new Promise((resolve, reject) => {
    isRecording = false;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        // Clean up
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        if (webcamStream) {
          webcamStream.getTracks().forEach(track => track.stop());
        }

        cancelAnimationFrame(animationFrameId);
        removeOverlay();
        releaseScreenAwake();

        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        resolve(blob);
      };

      mediaRecorder.stop();
    } else {
      reject(new Error('No active recording'));
    }
  });
}

function createOverlay(autoMinimize) {
  overlayContainer = document.createElement('div');
  overlayContainer.id = 'flojo-overlay';
  overlayContainer.innerHTML = `
    <div class="flojo-menu-bar">
      <div class="flojo-menu-content">
        <span class="flojo-title">Flojo Recording</span>
        <div class="flojo-controls">
          <button class="flojo-btn flojo-pause-btn" title="Pause/Resume">⏸</button>
          <button class="flojo-btn flojo-mute-btn" title="Toggle Mute">🔊</button>
          <button class="flojo-btn flojo-restart-btn" title="Restart">↻</button>
          <button class="flojo-btn flojo-minimize-btn" title="Minimize">−</button>
          <button class="flojo-btn flojo-exit-btn" title="Exit">✕</button>
        </div>
      </div>
      <div class="flojo-status-indicator"></div>
    </div>
  `;

  // Add CSS
  const style = document.createElement('style');
  style.textContent = `
    #flojo-overlay {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .flojo-menu-bar {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      backdrop-filter: blur(10px);
      cursor: grab;
      user-select: none;
      transition: all 0.3s ease;
    }

    .flojo-menu-bar.minimized {
      padding: 8px 12px;
    }

    .flojo-menu-bar.minimized .flojo-menu-content {
      display: none;
    }

    .flojo-menu-content {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .flojo-title {
      font-size: 14px;
      font-weight: 600;
      white-space: nowrap;
    }

    .flojo-controls {
      display: flex;
      gap: 8px;
    }

    .flojo-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      border-radius: 6px;
      padding: 6px 8px;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
    }

    .flojo-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.1);
    }

    .flojo-btn:active {
      transform: scale(0.95);
    }

    .flojo-status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4CAF50;
      animation: flojo-pulse 1.5s infinite;
    }

    .flojo-status-indicator.paused {
      background: #ff9800;
      animation: none;
    }

    @keyframes flojo-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlayContainer);

  // Make menu bar draggable
  makeDraggable(overlayContainer.querySelector('.flojo-menu-bar'));

  // Add event listeners
  document.querySelector('.flojo-pause-btn').addEventListener('click', () => {
    togglePause(!isPaused);
  });

  document.querySelector('.flojo-mute-btn').addEventListener('click', toggleMute);
  document.querySelector('.flojo-restart-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'requestReset' });
  });

  document.querySelector('.flojo-minimize-btn').addEventListener('click', toggleMinimize);
  document.querySelector('.flojo-exit-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'requestStop' });
  });

  if (autoMinimize) {
    setTimeout(toggleMinimize, 2000);
  }
}

function updateOverlayStatus() {
  const indicator = document.querySelector('.flojo-status-indicator');
  if (indicator) {
    if (isPaused) {
      indicator.classList.add('paused');
    } else {
      indicator.classList.remove('paused');
    }
  }
}

function toggleMinimize() {
  const menuBar = document.querySelector('.flojo-menu-bar');
  if (menuBar) {
    menuBar.classList.toggle('minimized');
  }
}

function toggleMute() {
  // Toggle audio tracks
  if (screenStream) {
    screenStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  }
  if (webcamStream) {
    webcamStream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
  }

  const muteBtn = document.querySelector('.flojo-mute-btn');
  if (muteBtn) {
    muteBtn.textContent = screenStream?.getAudioTracks()[0]?.enabled ? '🔊' : '🔇';
  }
}

function removeOverlay() {
  if (overlayContainer) {
    overlayContainer.remove();
  }
  // Remove injected style
  document.querySelectorAll('style').forEach(s => {
    if (s.textContent.includes('flojo-overlay')) {
      s.remove();
    }
  });
}

function makeDraggable(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    const parent = element.parentElement;
    const newTop = parent.offsetTop - pos2;
    const newLeft = parent.offsetLeft - pos1;

    // Keep within viewport
    const rect = parent.getBoundingClientRect();
    if (newTop >= 0 && newLeft >= 0 && newTop + rect.height <= window.innerHeight && newLeft + rect.width <= window.innerWidth) {
      parent.style.top = newTop + 'px';
      parent.style.left = newLeft + 'px';
    }
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function keepScreenAwake() {
  // Use Fullscreen API to keep screen awake (if available)
  if (document.documentElement.requestFullscreen) {
    // Only request if user interaction
  }
}

function releaseScreenAwake() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}
