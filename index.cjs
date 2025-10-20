#!/usr/bin/env node

const {spawn} = require('child_process');
const {join} = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const which = require('which');

dotenv.config();

const searchPaths = {
    win32: [
        'C:\\Program Files\\Wonderland\\WonderlandEngine\\bin',
        'C:\\Program Files (x86)\\Wonderland\\WonderlandEngine\\bin',
    ],
    darwin: ['/Applications', '/usr/local/bin', '/usr/bin'],
    linux: ['/usr/local/bin/Wonderland', '/usr/bin/Wonderland', '/bin/Wonderland'],
};

let executableName = 'WonderlandEditor';
switch (process.platform) {
    case 'win32':
        executableName += '.exe';
        break;
    case 'darwin':
        executableName += '.app';
        break;
}
const directoriesToSearch = searchPaths[process.platform] ?? ['/'];

/**
 * Tries to find the Wonderland Editor executable.
 */
async function findExecutable(directories) {
    const execPath = await which(executableName, {nothrow: true});
    if (execPath) {
        return execPath;
    }

    for (const dir of directories) {
        const exePath = join(dir, executableName);
        if (fs.existsSync(exePath)) {
            return exePath;
        }
    }
    return null;
}

/**
 * Checks if a given path is executable.
 * @returns {boolean} True if the path is executable, false otherwise.
 */
function isExecutable(path) {
    if (process.platform === 'win32') {
        return path.endsWith('.exe');
    } else {
        try {
            fs.accessSync(path, fs.constants.X_OK);
            return true;
        } catch (err) {
            return false;
        }
    }
}

/**
 * Function to find the WonderlandEditor path
 * @returns the path to the editor executable
 */
async function findWonderlandEditorPath() {
    let path = process.env.WONDERLAND_EDITOR_PATH;
    if (path && fs.existsSync(path)) {
        if (!isExecutable(path)) {
            path = join(path, executableName);
        }
    } else {
        // Search for the executable in common directories and path variables
        path = await findExecutable(directoriesToSearch);
    }

    console.log(path);
    if (!path) {
        console.log(
            `Error: ${executableName} not found. Please add a .env file with the path to WonderlandEditor.`
        );
        if (require.main === module) {
            process.exit(1);
        }
    }

    if (process.platform === 'darwin' && path.endsWith('.app')) {
        path = join(path, 'Contents/MacOS/WonderlandEditor');
    }

    return path;
}

/**
 * Tries to find the Wonderland Editor path and runs the editor with the given arguments.
 *
 * For more information and a list of all arguments visit https://wonderlandengine.com/editor/commands
 * @param {readonly string[]} args Wonderland Editor Arguments. The arguments are passed directly to the editor.
 */
async function runWonderlandEditor(args) {
    const editorPath = await findWonderlandEditorPath();
    return new Promise((resolve, reject) => {
        const child = spawn(editorPath, args, {stdio: 'inherit'});

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                const err = new Error(`Process exited with code ${code}`);
                // provide the exit code on the error for callers
                err.code = code;
                reject(err);
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}

if (require.main === module) {
    (async () => {
        try {
            await runWonderlandEditor(process.argv.slice(2));
        } catch (err) {
            console.error('Build failed:', err);
            process.exit(err?.code ?? 1);
        }
    })();
}

module.exports = {runWonderlandEditor};
