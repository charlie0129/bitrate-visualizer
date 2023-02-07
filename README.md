# Bitrate Visualizer

Bitrate Visualizer is a tool to visualize the bitrate of an audio file in realtime, so you can inspect how the audio encoder allocates bitrate at any instant.

It runs in command-line to analyze your song and then visualizes it in your browser for realtime playback. A GUI is possible, but it is not planned.

Screenshot:

<img width="827" alt="image" src="https://user-images.githubusercontent.com/55270174/217359192-e64c947b-cb39-46f2-aadb-5b7e45c97678.png">

GIF:

![gif-usage](https://user-images.githubusercontent.com/55270174/217090489-f93ce152-654f-4616-bc1e-00c78a8c3d93.gif)


## Usage

- Make sure you have `ffprobe` installed. It is typically included in the `ffmpeg` package.
- Make sure you have `node.js` installed.
- Clone or download this repo `git clone --depth=1 https://github.com/charlie0129/bitrate-visualizer.git && cd bitrate-visualizer`
- Install dependencies by `yarn install` or `npm install`
- Choose a song you want to visualize. Note that you want a song that is encoded using VBR, otherwise the bitrate will be constant, which has no point to visualize. For example, wav audio is always CBR, while some AAC, MP3, ALAC, FLAC, Vorbis, Opus audio is VBR. If you are not sure, you can try it anyway.
- Run Bitrate Visualizer `node index.js <path-to-song>`
  - If you want to use Bitrate Visualizer more easily, you can give it a shell alias like this `alias bitratev="node $(pwd)/index.js"`, then you can run it by `bitratev <path-to-song>`
- Your browser will open automatically and you can see the visualization
