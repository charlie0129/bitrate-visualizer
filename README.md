# Bitrate Visualizer

Bitrate Visualizer is a tool to visualize the bitrate of an audio file in realtime, so you can inspect how the audio encoder allocates bitrate at any instant.

<img width="801" alt="image" src="https://user-images.githubusercontent.com/55270174/217414589-8fd79013-d897-41a5-a804-1a6cfaa05e72.png">

<img width="800" alt="scrrec" src="https://user-images.githubusercontent.com/55270174/217415947-4a0cd26f-2b4a-48b5-9a90-a946021f8150.gif">

Q: Why the prebuilt binary is so big?

A: I bundled `ffprobe` in the app so you don't need to install it manually. Over 90% of the size is from `ffprobe`. The app itself is built using Tauri, which has only a few megabytes in size. It is possible to build one without `ffprobe` to significantly reduce disk size footprint but that would sacrifice convenience since the user need to install `ffprobe` by himself.