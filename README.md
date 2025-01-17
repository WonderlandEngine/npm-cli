# wonderland-editor CLI

A command-line interface for building Wonderland Engine projects through the installed editor.

## Prerequisites

You need to have Wonderland Engine installed on your system. To learn more, and download Wonderland Engine, head over to <https://wonderlandengine.com/>.

## Installation

Install the CLI tool globally or locally using npm:

### Global Installation

```bash
npm install -g @wonderlandengine/cli
```

### Local Installation

```bash
npm install --save-dev @wonderlandengine/cli
```

## Usage

### With npm Scripts

Add a script entry to your `package.json` to build your project using `wonderland-editor`:

```json
"scripts": {
  "build": "wonderland-editor --package --windowless --project BlendModesDemo.wlp"
}
```

Then, run the build script using npm:

```bash
npm run build
```

### Environment Variables

The `WONDERLAND_EDITOR_PATH` environment variable can be used to specify the path to the Wonderland Editor executable. You can set this variable in a `.env` file in the root of your project:

```env
WONDERLAND_EDITOR_PATH=/path/to/WonderlandEditor
```

### Programmatic Usage

You can also use `wonderland-editor` programmatically in your Node.js scripts:

```javascript
import { runWonderlandEditor } from '@wonderlandengine/cli';

try {
    await runWonderlandEditor(['--package', '--windowless', '--project', 'YourAwesomeProject.wlp']);
} catch (e) {
    console.error('Error during build', e);
}

```

## Project Structure

The following functions and variables are used in the CLI:

- `runWonderlandEditor(args)`: Runs the Wonderland Editor with the provided arguments.

## Common Search Paths

The CLI searches for the Wonderland Editor executable in using the PATH
environment variable and common locations in the following common paths based on the platform:

- **Windows**:
  - `C:\\Program Files\\Wonderland\\WonderlandEngine\\bin`
  - `C:\\Program Files (x86)\\Wonderland\\WonderlandEngine\\bin`
- **macOS**:
  - `/Applications/Wonderland`
  - `/usr/local/bin`
  - `/usr/bin`
- **Linux**:
  - `/usr/local/bin/Wonderland`
  - `/usr/bin/Wonderland`
  - `/bin/Wonderland`

If the executable is not found in these paths and the `WONDERLAND_EDITOR_PATH` environment variable is not set, the CLI will prompt you to add a `.env` file with the path to the Wonderland Editor.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
