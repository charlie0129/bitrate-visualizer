# Bitrate Visualizer

Bitrate Visualizer is a simple tool to visualize the bitrate of an audio file in realtime. You can inspect how the audio encoder allocates bitrate throughout the entire song.

<img width="921" alt="screenshot" src="https://user-images.githubusercontent.com/55270174/217046986-79c1d68b-0096-4698-bb65-921323158c0f.png">

![gif-usage](https://user-images.githubusercontent.com/55270174/217047377-41d8bfd2-e002-4c33-bd93-c345453da07b.gif)


## Usage

- Make sure you have `ffprobe` installed. It is typically included in the `ffmpeg` package.
- Make sure you have `node.js` installed.
- Clone or download this repo `git clone --depth=1 https://github.com/charlie0129/bitrate-visualizer.git && cd bitrate-visualizer`
- Install dependencies `yarn install`
- Choose a song you want to visualize (you want a song that is encoded using VBR, otherwise the bitrate will be constant, which has no point to visualize)
- Run Bitrate Visualizer `node index.js <path-to-song>`
  - If you want to use Bitrate Visualizer more easily, you can give it a shell alias like this `alias bitratev="node $(pwd)/index.js"`, then you can run it by `bitratev <path-to-song>`
- Your browser will open automatically and you can see the visualization
