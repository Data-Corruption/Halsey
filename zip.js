const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// if zip exists, delete it
if (fs.existsSync('halsey-bot.zip')) {
    fs.unlinkSync('halsey-bot.zip');
}

var executablePath = path.join(__dirname, 'node_modules', '7zip-bin');

if (process.platform === 'win32') {
    executablePath = path.join(executablePath, 'win', 'x64', '7za.exe');
} else if (process.platform === 'darwin') {
    executablePath = path.join(executablePath, 'mac', 'x64', '7za');
} else if (process.platform === 'linux') {
    executablePath = path.join(executablePath, 'linux', 'x64', '7za');
    fs.chmodSync(executablePath, '755');
} else {
    console.log('Unsupported platform');
    process.exit(1);
}

// zip the files
exec(`"${executablePath}" a -r halsey-bot.zip bin package.json package-lock.json npm-readme.md LICENSE.md -xr!node_modules\\*`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(stdout);
});
