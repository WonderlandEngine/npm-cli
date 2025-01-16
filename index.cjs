#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers')

// Load environment variables from .env file
dotenv.config();

let WonderlandEditorPath = process.env.WONDERLAND_EDITOR_PATH || null;

// Define common search paths
const searchPaths = {
    win32: ['C:\\Program Files\\Wonderland\\WonderlandEngine\\bin', 'C:\\Program Files (x86)\\Wonderland\\WonderlandEngine\\bin'],
    darwin: ['/Applications/Wonderland', '/usr/local/bin', '/usr/bin'],
    linux: ['/usr/local/bin/Wonderland', '/usr/bin/Wonderland', '/bin/Wonderland']
};

// Get the executable name and search paths based on the platform
const platform = process.platform;
const executableName = platform === 'win32' ? 'WonderlandEditor.exe' : 'WonderlandEditor';
const directoriesToSearch = searchPaths[platform] || ['/'];

// Function to find the executable
const findExecutable = (directories, callback) => {
    for (const dir of directories) {
        const exePath = path.join(dir, executableName);
        if (fs.existsSync(exePath)) {
            return callback(exePath);
        }
    }
    return callback(null);
};

// Function to build the project file
function runWonderlandEditor(args) {
    return new Promise((resolve, reject) => {
        findWonderlandEditorPath((WonderlandEditorPath) => {
            const process = spawn(WonderlandEditorPath, args, { stdio: 'inherit' });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Process exited with code ${code}`));
                }
            });

            process.on('error', (err) => {
                console.error('Error launching Wonderland Editor', err);
                reject(err);

            });
        });
    });

}

// Function to find and set the WonderlandEditor path
function findWonderlandEditorPath(callback) {
    if (WonderlandEditorPath && fs.existsSync(WonderlandEditorPath)) {
        WonderlandEditorPath = path.join(WonderlandEditorPath, executableName);
        callback(WonderlandEditorPath);
    } else {
        findExecutable(directoriesToSearch, (resolvedPath) => {
            if (!resolvedPath) {
                console.error(`Error: ${executableName} not found. Please add a .env file with the path to WonderlandEditor.`);
                process.exit(1);
            }

            console.log(`Found ${executableName} at: ${resolvedPath}`);
            callback(resolvedPath);
        });
    }
}
// Command-line interface
if (require.main === module) {
    const argv = yargs(hideBin(process.argv))
        .usage('Usage: $0 [wonderland-args...]')
        .help('h')
        .alias('h', 'help')
        .argv;

    console.log(argv._);

    runWonderlandEditor(argv).catch((err) => {
        console.error('Build failed:', err);
    });
}

module.exports = { runWonderlandEditor };