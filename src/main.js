const { listen } = window.__TAURI__.event
const { Command } = window.__TAURI__.shell

function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  var ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

function parsePacket(p) {
  return {
    ts: p.pts_time,
    bitrate: p.size * 8 / p.duration / 1024,
  }
}

function findMaxBitrate(packets) {
  return packets.reduce((max, p) => Math.max(max, p.bitrate), 0);
}

// Draw horizontal line for a bitrate
function drawDrawBitrateLine(ctx, bitrate, color = 'gray', suffix = '', alignRight = false) {
  if (bitrate > maxBitrate) {
    return
  }
  const y = height - bitrate * heightScale;
  const c = ctx.strokeStyle
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y)
  ctx.stroke();
  if (alignRight) {
    ctx.textAlign = "end";
    ctx.fillText(`${bitrate.toFixed(0)} kbps${suffix}`, width, y - 2);
    ctx.textAlign = "start";
  } else {
    ctx.fillText(`${bitrate.toFixed(0)} kbps${suffix}`, 0, y - 2);
  }
  ctx.strokeStyle = c;
  ctx.fillStyle = c;
}

let axisInterval = 50;
const intervalPresets = [10, 20, 50, 100, 200, 300, 400, 500]
function drawAxis(ctx) {
  for (let i = 1; ; i++) {
    const target = i * axisInterval;
    if (target > maxBitrate) break;
    drawDrawBitrateLine(ctx, target);
  }
}

let lastTs = 0;
let packetsPerSecond = 0;
let framesPerSecond = 0;
let frames = 0;
let lastFrame = 0;
let lastProcessedUniquePackets = 0;

// Draw vertical line for each packet. This is called every frame.
function drawLine(ctx, pktIdx, ts) {
  if (ts - lastTs > 100) {
    framesPerSecond = (frames - lastFrame) / (ts - lastTs) * 1000;
    packetsPerSecond = (processedUniquePackets - lastProcessedUniquePackets) / (ts - lastTs) * 1000;
    lastProcessedUniquePackets = processedUniquePackets;
    lastFrame = frames;
    lastTs = ts;
  }
  frames++;

  ctx.clearRect(0, 0, width, height);

  const p = packets[pktIdx];
  const x = width;

  ctx.beginPath();
  ctx.moveTo(x, height - p.bitrate * heightScale);
  ctx.lineTo(x, height)
  ctx.stroke();

  for (let i = 1; i < width + 1; i++) {
    const idx = pktIdx - i;
    if (idx < 0) break;
    const p = packets[idx];
    ctx.beginPath();
    ctx.moveTo(x - i, height - p.bitrate * heightScale);
    ctx.lineTo(x - i, height)
    ctx.stroke();
  }

  drawAxis(ctx)
  // Current bitrate
  drawDrawBitrateLine(ctx, p.bitrate, 'red', ' (current)', true);
  // Average bitrate
  drawDrawBitrateLine(ctx, averageBitrate, 'green', ' (avg)', true);
  // Max bitrate
  ctx.textAlign = "end";
  ctx.fillText(`${maxBitrate.toFixed(0)} kbps (max)`, width, 8);
  ctx.fillStyle = "gray";
  ctx.fillText(`${p.ts.toFixed(3)}s / ${packets[packets.length - 1].ts.toFixed(3)}s`, width, height - 2);
  ctx.fillText(`${(p.accumulatedSize / 1024).toFixed(0)} KB / ${(totalSize / 1024).toFixed(0)} KB`, width, height - 12);
  ctx.fillText(`${Math.min(packetsPerSecond, framesPerSecond).toFixed(2)} graph updates/s`, width, height - 23);
  ctx.fillText(`${packetsPerSecond.toFixed(2)} audio packets/s`, width, height - 33);
  ctx.fillText(`${framesPerSecond.toFixed(2)} fps`, width, height - 43);
  ctx.fillStyle = "black";
  ctx.textAlign = "start";
}

let lastPacketIdx = 0;
let processedUniquePackets = 0;
function findPacketByTimestamp(ts) {
  for (let offset = 0; offset < packets.length; offset++) {
    let i = lastPacketIdx + offset;
    if (i >= packets.length) {
      return packets.length - 1;
    }
    const p = packets[i];
    if (p.ts > ts) {
      if (i !== lastPacketIdx) {
        processedUniquePackets++;
      }
      lastPacketIdx = i;
      return i;
    }
  }
  return packets.length - 1;
}

const player = document.getElementById('player')
const graph = document.querySelector('#bitrate_visual')
// Get the size of the canvas in CSS pixels.
const width = graph.getBoundingClientRect().width
const height = graph.getBoundingClientRect().height
let ctx = setupCanvas(graph)
let heightScale = 0;
let maxBitrate = 0;
let totalSize = 0;
let averageBitrate = 0;
let packets = [];
let intervalId = 0;
let animationFrameRef;

player.onseeked = () => {
  lastPacketIdx = 0;
  drawLine(ctx, findPacketByTimestamp(player.currentTime), window.performance.now())
}

player.onplay = () => {
  lastPacketIdx = 0;
  animationFrameRef = window.requestAnimationFrame(step);
}

player.onpause = () => {
  window.cancelAnimationFrame(animationFrameRef);
}

function step(ts) {
  drawLine(ctx, findPacketByTimestamp(player.currentTime), ts)
  animationFrameRef = window.requestAnimationFrame(step);
}

const elTitle = document.getElementById("audio_title");
const elExtra = document.getElementById("extra");

async function getPackets(file) {
  heightScale = 0;
  maxBitrate = 0;
  totalSize = 0;
  averageBitrate = 0;
  packets = [];
  lastPacketIdx = 0;
  processedUniquePackets = 0;
  lastTs = 0;
  packetsPerSecond = 0;
  framesPerSecond = 0;
  frames = 0;
  lastFrame = 0;
  lastProcessedUniquePackets = 0;

  player.pause()
  elTitle.innerText = "Analyzing..."

  const command = Command.sidecar('../ffprobe-bin/ffprobe', [
    "-show_packets",
    "-show_entries",
    "packet=pts_time,duration_time,size",
    "-print_format",
    "csv=print_section=0",
    file
  ]);

  console.log("executing ffprobe on file", file);
  let ret;
  try {
    ret = await command.execute();
  } catch (e) {
    elTitle.innerText = "ffprobe failed! Did you put a valid audio file?"
    elExtra.innerText = ret.stderr
    return
  }

  console.log("done");

  if (ret.code !== 0) {
    elTitle.innerText = "ffprobe failed! Did you put a valid audio file?"
    elExtra.innerText = ret.stderr
    return
  }

  player.src = window.__TAURI__.tauri.convertFileSrc(file)

  const ffprobeResult = ret.stdout

  elTitle.innerText = file
  elExtra.innerText = ""

  const lines = ffprobeResult.split('\n');
  const packetDataDecoded = []
  for (let i of lines) {
    if (!i) {
      continue
    }
    const words = i.split(',')
    if (words.length != 3) {
      continue
    }
    if (isNaN(words[0]) || isNaN(words[1]) || isNaN(words[2])) {
      continue
    }
    packetDataDecoded.push({
      'pts_time': +words[0],
      'duration': +words[1],
      'size': +words[2],
    })
  }

  packets = packetDataDecoded.map(p => {
    const pkt = parsePacket(p)
    totalSize += p.size;
    return {
      ...pkt,
      accumulatedSize: totalSize,
    }
  });

  maxBitrate = findMaxBitrate(packets);
  averageBitrate = totalSize / packets[packets.length - 1].ts / 1024 * 8
  heightScale = height / maxBitrate;

  // Find the best interval for the axis
  for (const preset of intervalPresets) {
    if (preset > maxBitrate / 10) {
      axisInterval = preset;
      break;
    }
  }

  drawAxis(ctx)
  drawLine(ctx, findPacketByTimestamp(player.currentTime), window.performance.now())

  player.play()
}

listen('tauri://file-drop', e => {
  getPackets(e.payload[0])
})
