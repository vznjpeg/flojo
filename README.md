# Flojo - Screen Recorder Chrome Extension

A powerful Chrome extension for recording your screen and webcam for YouTube tutorials. Similar to Loom, Flojo provides an intuitive interface with a floating control menu bar.

## Features

✨ **Screen Recording** - Record your entire screen at multiple quality levels (480p, 720p, 1080p)

🎥 **Webcam PiP** - Picture-in-Picture mode with your webcam displayed in a cropped circle

🎙️ **Audio Recording** - Record both system audio and microphone input

⏸️ **Pause/Resume** - Pause and resume recordings without losing data

🎛️ **Floating Menu Bar** - Minimizable control bar that floats on top of your content

📥 **Easy Download** - Download your recording as a WebM video file

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the extension folder
5. The extension icon will appear in your Chrome toolbar

## Setup

### Generate Icons (Optional)

The extension includes placeholder icon files. To generate proper icons, run:

```bash
node generate-icons.js
```

This creates 16x16, 48x48, and 128x128 PNG icons in the `icons/` folder.

### Create Icons Folder

```bash
mkdir -p icons
```

For now, the extension will work without icons, but you can add them later.

## Usage

1. Click the **Flojo icon** in your Chrome toolbar
2. Configure your recording settings:
   - ✓ Record Screen
   - ✓ Record Webcam (PiP)
   - ✓ Record Audio
   - ✓ Record System Audio
   - Video Quality (480p, 720p, 1080p)
3. Click **Start Recording**
4. Grant permissions for:
   - Screen capture
   - Microphone access
   - System audio (if available)
5. The floating **menu bar** appears on your page with controls:
   - **⏸ Pause** - Pause/resume recording
   - **🔊 Mute** - Toggle audio
   - **↻ Restart** - Start a new recording
   - **−** - Minimize menu bar
   - **✕** - Stop recording
6. Click **Stop** in the popup or **✕** on the floating menu
7. Download your recording in the popup

## Features Explained

### Floating Menu Bar

- **Draggable** - Drag the menu bar around your screen
- **Minimizable** - Collapse the menu to just a status indicator
- **Auto-minimize** - Option to auto-minimize after 2 seconds
- **Status Indicator** - Green pulse = recording, Orange = paused

### Webcam Display

- Appears as a **cropped circle** in the bottom-right corner
- Shows your face while you record your screen
- White border for visibility
- Automatically scales to fit the circle

### Recording Quality

Choose from three preset quality levels:
- **1080p** - Full HD (1920x1080) - Best for tutorials, larger files
- **720p** - HD (1280x720) - Good quality, balanced file size
- **480p** - SD (854x480) - Smaller files, adequate for quick demos

### Audio Options

- **Microphone** - Your voice
- **System Audio** - Application sounds, background music
- Both can be toggled independently
- Mute button on floating menu for quick control

## Keyboard Shortcuts

Currently, keyboard shortcuts are not implemented but can be added. All controls are available through:
- The popup menu in the extension
- The floating menu bar on your page

## Troubleshooting

### Permission Denied Errors

- Make sure you grant the extension permissions when prompted
- Check Chrome settings > Privacy and security > Site settings > Microphone/Camera

### Webcam Not Showing

- Verify your camera is working in other apps
- Check that "Record Webcam" is enabled in settings
- Grant microphone and camera permissions when prompted

### Audio Not Recording

- System audio recording only works on Linux and some Windows setups
- On macOS, you may need to install additional audio drivers
- Microphone audio is always available if device permissions are granted

### Black Screen in Recording

- Make sure you selected the correct display/window when prompted
- Try restarting the recording
- Check if other apps are using screen capture

## Files Structure

```
flojo/
├── manifest.json       - Extension configuration
├── popup.html         - Popup interface
├── popup.js          - Popup logic and controls
├── content.js        - Page-level recording logic
├── background.js     - Service worker
├── styles.css        - Popup styling
├── icons/            - Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── README.md         - This file
```

## How It Works

1. **Popup Control** - Main UI for starting/stopping recordings and configuring settings
2. **Content Script** - Runs on your page, handles screen/webcam capture and compositing
3. **Canvas Compositing** - Combines screen + webcam into single video stream
4. **MediaRecorder API** - Records the composite stream
5. **Blob Storage** - Saves recording data, allows download as WebM file

## Browser Compatibility

- ✅ Chrome 72+
- ✅ Edge 79+
- ❌ Firefox (requires WebExtensions API modifications)
- ❌ Safari (requires macOS app)

## Performance Tips

- Use **720p** for balanced quality and file size
- Close unnecessary tabs/applications before recording
- Record with decent lighting for best webcam quality
- Use a good microphone for better audio quality

## Advanced Usage

### Custom Output Format

To convert WebM to MP4:
```bash
ffmpeg -i recording.webm -c:v libx264 -preset medium recording.mp4
```

### Editing

The WebM file can be edited in:
- Adobe Premiere Pro
- Final Cut Pro
- DaVinci Resolve
- OBS Studio
- Shotcut (free)

## Known Limitations

- WebM format is the native output (MP4 requires additional codecs)
- System audio may not work on all Windows versions
- PiP circle size is fixed (can be customized in CSS)
- No built-in editing features

## Future Enhancements

- [ ] MP4 export support
- [ ] Customizable PiP size and position
- [ ] Multiple video format support
- [ ] Annotation/drawing tools
- [ ] Real-time transcription
- [ ] Auto-upload to cloud storage
- [ ] Video editing built-in
- [ ] Keyboard shortcuts
- [ ] Recording presets
- [ ] Auto-save functionality

## License

MIT License - Feel free to use and modify!

## Support

Found a bug? Have a feature request? Open an issue on GitHub or reach out!

---

**Happy recording! 🎥✨**
