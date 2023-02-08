# Bitrate Visualizer

Bitrate Visualizer is a tool to visualize the bitrate of an audio file in realtime, so you can inspect how the audio encoder allocates bitrate at any instant.


Q: Why the prebuilt binaries are so big?

A: I bundled `ffprobe` in it, so 90%+ of the size is from `ffprobe`. The app itself is using Tauri, which is a very small framework and only have a few megabytes in size. You can build one without `ffprobe` if you want a smaller binary.