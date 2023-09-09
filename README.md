# RetroArch image playlist fixer

This script allows you to fix RetroArch's image playlist file easily with a couple of settings change.

## Why does it exist?

RetroArch currently doesn't have a way to fix it within its menu but also because i could add some new features too like automatically adding missing images in the playlist.

## Installation

To install it you'll need installed:
- NodeJS;
- A terminal (Termux or whatever);

then type:
```bash
npm install -g fix-retroarch-image-playlist
```

Finally run:
```bash
fixRetroarchImagePlaylist --config
```
to configure the script with the correct paths

### How to use it?

You'll need to either type `fixRetroarchImagePlaylist` in the terminal or `node fix-retroarch-image-playlist.mjs` in the same folder of where the package is installed

Read [COMMAND LINE PARAMETERS](COMMAND-LINE-PARAMETERS.md) for more information about the available parameters