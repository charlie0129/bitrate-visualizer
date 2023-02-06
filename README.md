# Bitrate Visualizer

Bitrate Visualizer is a simple tool to visualize the realtime bitrate of an audio file.

## Usage

- Make sure you have `ffprobe` installed. It is typically included in the `ffmpeg` package.
- Clone or download this repo `git clone --depth=1 https://github.com/charlie0129/bitrate-visualizer.git && cd bitrate-visualizer`
- Install dependencies `yarn install`
- Choose a song you want to visualize (you want a song that is encoded using VBR, otherwise the bitrate will be constant, which has no point to visualize) and run `node index.js <path-to-song>`. If you want to use this tool more easily, you can give it a shell alias in you `.bashrc/.zshrc`.
- Your browser will open automatically and you can see the visualization.