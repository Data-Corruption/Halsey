const fs = require('fs');
const path = require('path');

function copyFolderRecursiveSync(from, to) {
    fs.mkdirSync(to);
    fs.readdirSync(from).forEach(element => {
        if (fs.lstatSync(path.join(from, element)).isFile()) {
            fs.copyFileSync(path.join(from, element), path.join(to, element));
        } else {
            copyFolderRecursiveSync(path.join(from, element), path.join(to, element));
        }
    });
}

// function that deletes all files with a specific extension in a folder and all subfolders
function removeFileByType(folder, type) {
    fs.readdirSync(folder).forEach(element => {
        if (fs.lstatSync(path.join(folder, element)).isFile()) {
            if (path.extname(path.join(folder, element)) == type) {
                fs.rmSync(path.join(folder, element));
            }
        } else {
            removeFileByType(path.join(folder, element), type);
        }
    });
}

const binPath = path.join(__dirname, 'bin');
const srcPath = path.join(__dirname, 'src');

// if the bin folder exists, delete it
if (fs.existsSync(binPath)) { fs.rmSync(binPath, { recursive: true }); }

// copy the src folder to the bin folder
copyFolderRecursiveSync(srcPath, binPath);

// delete all the .ts files in the bin folder and all subfolders
removeFileByType(binPath, '.ts');
// delete all the .json files in the bin folder and all subfolders
removeFileByType(binPath, '.json');