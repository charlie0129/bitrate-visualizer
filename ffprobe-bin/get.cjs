/**
 * This script is used to rename the binary with the platform specific postfix.
 * When `tauri build` is ran, it looks for the binary name appended with the platform specific postfix.
 */

const childProcess = require('child_process');
const fs = require('fs')
const pathToFfprobe = require('ffprobe-static').path;

let extension = ''
if (process.platform === 'win32') {
    extension = '.exe'
}

function runCommand(cmd) {
    const ch = childProcess.spawnSync(cmd[0], cmd.slice(1));
    return ch.stdout?.toString()
}

async function main() {
    const rustInfo = runCommand(['rustc', '-vV'])
    const targetTriple = /host: (\S+)/g.exec(rustInfo)[1]
    if (!targetTriple) {
        console.error('Failed to determine platform target triple')
    }
    fs.copyFileSync(
        pathToFfprobe,
        `ffprobe-${targetTriple}${extension}`
    )
}

main().catch((e) => {
    throw e
})
