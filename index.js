const express = require('express');
const path = require('path');
const childProcess = require('child_process');
const open = require('open');
const arg = require('arg');

const args = arg({
    '--port': Number,
    '-p': '--port',
});

if (args._.length != 1) {
    console.log("Usage: node index.js [-p/--port] <path to audio file>");
    process.exit(1)
}
const port = args['--port'] || 8085;
const file = args._[0];

function runCommand(cmd) {
    const ch = childProcess.spawnSync(cmd[0], cmd.slice(1));
    const returnCode = ch.status;
    if (returnCode !== 0) {
        console.warn(ch.stderr?.toString());
        console.warn("Command failed with return code: " + returnCode);
        console.warn("ffprobe return code is not 0. Please check the log above for more information. Just be aware that bitrate-visualizer may not work as expected.");
    }
    return ch.stdout?.toString()
}

const ffprobeResult = runCommand([
    "ffprobe",
    "-show_packets",
    "-show_entries",
    "packet=pts_time,duration_time,size",
    "-print_format",
    "csv=print_section=0",
    file,
])

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

const app = express()

app.use(express.static(path.join(__dirname, 'web'), {
    index: ['index.html']
}))

app.get('/packets.json', (req, res) => {
    res.send(JSON.stringify(packetDataDecoded))
})

app.get('/audio', (req, res) => {
    res.sendFile(file)
})

app.get('/title', (req, res) => {
    res.send(path.basename(file))
})

app.listen(port, () => {
    console.log(`Open http://localhost:${port} for results. Your browser should open shortly...`)
    open(`http://localhost:${port}/`)
})
