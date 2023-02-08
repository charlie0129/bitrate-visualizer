# Bitrate Visualizer

Bitrate Visualizer is a tool to visualize the bitrate of an audio file in realtime, so you can inspect how the audio encoder allocates bitrate at any instant.

<img width="801" alt="image" src="https://user-images.githubusercontent.com/55270174/217414589-8fd79013-d897-41a5-a804-1a6cfaa05e72.png">

<img width="800" alt="scrrec" src="https://user-images.githubusercontent.com/55270174/217415947-4a0cd26f-2b4a-48b5-9a90-a946021f8150.gif">

Q: Why the prebuilt binary is so big?

A: I bundled `ffprobe` in the app so you don't need to install it manually. Over 90%+ of the size is from `ffprobe`. The app itself is using Tauri, which is a very small framework and only have a few megabytes in size. You can build one without `ffprobe` if you want a smaller binary.