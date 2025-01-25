#!/usr/bin/env node

const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const yargs = require('yargs');
const { hideBin } = require('yargs/helpers');
const which = require('which');

dotenv.config();

const searchPaths = {
    win32: ['C:\\Program Files\\Wonderland\\WonderlandEngine\\bin', 'C:\\Program Files (x86)\\Wonderland\\WonderlandEngine\\bin'],
    darwin: ['/Applications', '/usr/local/bin', '/usr/bin'],
    linux: ['/usr/local/bin/Wonderland', '/usr/bin/Wonderland', '/bin/Wonderland']
};

let executableName = 'WonderlandEditor';
switch(process.platform) {
    case 'win32': executableName += '.exe'; break;
    case 'darwin': executableName += '.app'; break;
}
const directoriesToSearch = searchPaths[process.platform] ?? ['/'];

/**
 * Tries to find the Wonderland Editor executable.
 */
async function findExecutable(directories) {
    const execPath = await which(executableName, { nothrow: true });
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
};


/**
 * Function to find the WonderlandEditor path
 * @returns the path to the editor executable
 */
async function findWonderlandEditorPath() {
    let path = process.env.WONDERLAND_EDITOR_PATH;
    if (path && fs.existsSync(path)) {
        path = join(path, executableName);
    } else {
        // Search for the executable in common directories and path variables
        path = await findExecutable(directoriesToSearch);
    }

    console.log(path);
    if (!path) {
        console.log(`Error: ${executableName} not found. Please add a .env file with the path to WonderlandEditor.`);
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
    try {
        const path = await findWonderlandEditorPath();
        const process = spawn(path, args, { stdio: 'inherit' });

        process.on('close', (code) => {
            if (code !== 0) {
                const err = `Process exited with code ${code}`;
                throw new Error(err, {
                    cause: 'Wonderland Editor execution failed, check log for more info.'
                });
            }
        });

        process.on('error', (err) => {
            throw err;
        });

    } catch (err) {
        console.error('Error finding the editor path', err);
        throw err;
    }

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
