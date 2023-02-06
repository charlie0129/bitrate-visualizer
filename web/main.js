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
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
  // canvas.style+=` scale(${1/dpr});`;
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

function findAverageBitrate(packets) {
  const sum = packets.reduce((sum, p) => sum + p.bitrate, 0);
  return sum / packets.length;
}

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

function drawLine(ctx, pktIdx) {
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
  ctx.textAlign = "start";
}

let lastPacketIdx = 0;
function findPacketByTimestamp(ts) {
  for (let offset = 0; offset < packets.length; offset++) {
    let i = lastPacketIdx + offset;
    if (i >= packets.length) {
      return packets.length - 1;
    }
    const p = packets[i];
    if (p.ts > ts) {
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
let averageBitrate = 0;
let packets = [];
let intervalId = 0;
let animationFrameRef;

player.onseeked = () => {
  lastPacketIdx = 0;
  drawLine(ctx, findPacketByTimestamp(player.currentTime))
}

player.onplay = () => {
  lastPacketIdx = 0;
  animationFrameRef = window.requestAnimationFrame(step);
}

player.onpause = () => {
  window.cancelAnimationFrame(animationFrameRef);
}


function step(ts) {
  drawLine(ctx, findPacketByTimestamp(player.currentTime))
  animationFrameRef = window.requestAnimationFrame(step);
}

fetch('packets.json').then(r => r.json()).then(p => {
  packets = p.map(p => parsePacket(p));
  maxBitrate = findMaxBitrate(packets);
  averageBitrate = findAverageBitrate(packets);
  heightScale = height / maxBitrate;
  // Find the best interval for the axis
  for (const preset of intervalPresets) {
    if (preset > maxBitrate / 10) {
      axisInterval = preset;
      break;
    }
  }
  drawAxis(ctx)
});

fetch('title').then(r => r.text()).then(t => {
  document.getElementById("audio_title").innerText = t;
});
