#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const which = require('which');

dotenv.config();

let WonderlandEditorPath = process.env.WONDERLAND_EDITOR_PATH || null;

const searchPaths = {
    win32: ['C:\\Program Files\\Wonderland\\WonderlandEngine\\bin', 'C:\\Program Files (x86)\\Wonderland\\WonderlandEngine\\bin'],
    darwin: ['/Applications/Wonderland', '/usr/local/bin', '/usr/bin'],
    linux: ['/usr/local/bin/Wonderland', '/usr/bin/Wonderland', '/bin/Wonderland']
};

const platform = process.platform;
const executableName = platform === 'win32' ? 'WonderlandEditor.exe' : 'WonderlandEditor';
const directoriesToSearch = searchPaths[platform] || ['/'];

/**
 * Tries to find the Wonderland Editor executable 
 */
async function findExecutable(directories) {
    const execPath = await which(executableName, { nothrow: true });
    if (execPath) {
        return execPath;
    }

    for (const dir of directories) {
        const exePath = path.join(dir, executableName);
        if (fs.existsSync(exePath)) {
            return exePath;
        }
    }
    return null;
};


/**
 * Function to find the WonderlandEditor path
 * @returns the path to the editor executable
 */
async function findWonderlandEditorPath() {
    // Check if the path is already set though the environment variable
    if (WonderlandEditorPath && fs.existsSync(WonderlandEditorPath)) {
        WonderlandEditorPath = path.join(WonderlandEditorPath, executableName);
        return WonderlandEditorPath;
    } else {
        // Search for the executable in common directories and path variables
        const resolvedPath = await findExecutable(directoriesToSearch);
        if (!resolvedPath) {
            console.error(`Error: ${executableName} not found. Please add a .env file with the path to WonderlandEditor.`);
            process.exit(1);
        }
        return resolvedPath;

    }
}

/**
 * Tries to find the Wonderland Editor path and runs the editor with the given arguments.
 * 
 * For more information and a list of all arguments visit https://wonderlandengine.com/editor/commands
 * @param {readonly string[]} args Wonderland Editor Arguments. The arguments are passed directly to the editor.
  */
function runWonderlandEditor(args) {
    return new Promise(async (resolve, reject) => {
        let WonderlandEditorPath = null;
        try {
            WonderlandEditorPath = await findWonderlandEditorPath();
        } catch (err) {
            // Error finding the editor path
            console.error('Error finding the editor path', err);
            reject(err);
        }

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

}

// Command-line interface
if (require.main === module) {
    const argv = yargs(hideBin(process.argv))
        .scriptName('wonderland-editor')
        .usage('Usage: $0 [wonderland-editor-arguments...]')
        .example('$0 --package --windowless --project YourAwsomeProject.wlp', 'Package your project without opening the editor')
        .epilogue('For more information and a list of all arguments visit https://wonderlandengine.com/editor/commands')
        .alias('h', 'help')
        .help()
        .argv;

    runWonderlandEditor(hideBin(process.argv)).catch((err) => {
        console.error('Build failed:', err);
    });
}

module.exports = { runWonderlandEditor };