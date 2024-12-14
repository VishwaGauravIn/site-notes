<div align="center">
 <h1> <img src="https://lh3.googleusercontent.com/sdKiamsmN579AClKr5yPVE4LLLvg8adDOwTcog_f7ddRxkMsSEa9OjggLsAxPrzOy7YPJXdLSRV52r238DpLdDTQIA=s60" width="80px"><br/>SiteNotes</h1>
 <a href="https://www.buymeacoffee.com/VishwaGauravIn" target="_blank"><img alt="" src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=flat&logo=buy-me-a-coffee&logoColor=black" style="vertical-align:center" /></a>
 <img src="https://img.shields.io/npm/v/npm?style=normal"/>
 <img src="https://img.shields.io/badge/License-AGPL%20v3-brightgreen?style=normal"/>
 <img src="https://img.shields.io/github/languages/code-size/VishwaGauravIn/site-notes?logo=github&style=normal"/>
</div>
<br/>

## Overview
The **Site Notes Chrome Extension** is a lightweight tool designed to enhance your browsing experience by enabling you to attach quick notes to websites directly within the browser. Whether you're conducting research, taking quick reminders, or organizing your online workflow, this extension is your go-to solution.

### [🔗 Download Link](https://chromewebstore.google.com/detail/ejadohapkjcpjhlemdjmpnlhjponfomd)

## Features
### 1. 📝 Contextual Note-Taking
- Save notes directly associated with specific web pages or websites.
- Automatically link notes to the exact URL for easy retrieval.


### 2. 🏷️ Tagging System
- Add tags to organize your notes effectively.
- Automatically tag certain URLs, like YouTube videos, with a v tag for better organization.

### 3. 🔍 Powerful Search and Filtering
- Quickly search through your notes by keywords or tags.
- Filter notes based on associated tags for focused access.

### 4. 🖼️ View Modes
- Switch between "Page Notes" (for notes tied to the active page) and "All Notes" (view all saved notes).

### 5. 📋 Compact Side Panel Interface
- Access the extension via a sleek side panel that doesn’t disrupt your browsing experience.
- Easily create, edit, and delete notes directly from the panel.

### 6. 🔒 Privacy-Focused
- All your data is stored locally on your device.
- No external servers or third-party apps are used, ensuring maximum privacy and security.

### 7. ✨ Seamless User Experience
- Automatically fetch the website favicon and display it alongside notes for a more personalized touch.
- Works offline, so your notes are always accessible.

### 8. ⚙️ Customization and Management
- Export and import notes for backup or transferring to another device.
- Reset your data anytime with the built-in settings panel.

## Files
### Core Components
- `manifest.json`: The configuration file that defines the extension’s permissions, background scripts, and metadata.
- `background.js`: The background script managing extension logic.
- `sidepanel.html`: The user interface for the extension’s side panel.
- `sidepanel.js`: Contains functionality to manage notes within the side panel.

### Assets
- `icon16.png`: 16x16 icon for the extension.
- `icon32.png`: 32x32 icon for the extension.
- `icon192.png`: 192x192 icon for high-resolution displays.

### Development Metadata
- `.git`: Git version control directory (if applicable).

## Installation

1. Clone the repository or download it as a ZIP file.
   ```bash
   git clone https://github.com/your-username/site-notes.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`.

3. Enable **Developer mode** (toggle in the top-right corner).

4. Click **Load unpacked** and select the extracted folder.

5. The extension will appear in your toolbar, ready to use!

## Usage
1. Click on the extension icon in the Chrome toolbar to open the side panel.
2. Add, edit, or delete notes for the current website.
3. Revisit the website to see your saved notes displayed automatically.

## Development
### Prerequisites
- Node.js and npm (for advanced development or adding dependencies).
- Git (for version control).

### Building
This extension is designed to work out of the box. If you want to modify the code:
1. Edit the `background.js` or `sidepanel.js` as required.
2. Reload the extension in `chrome://extensions/` to test your changes.

### Contribution
Feel free to fork the repository, create a new branch, and submit a pull request with your improvements.

## License
This project is licensed under the AGPL-3.0 - see the [LICENSE](LICENSE) file for details.

## Author
Developed by [VishwaGauravIn](https://itsvg.in).

