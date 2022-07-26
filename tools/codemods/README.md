## Codemods

Contains different codemods that automate certain modifications to code (renaming, etc.).

Currently, there is only one: renaming measures to metrics.

### How to run

You can try the Measure -> Metric renaming by running the `run-measure-to-metric` like:

```bash
yarn run-measure-to-metric path/to/your/app
```

### How to debug the transformations in VS Code

You can debug the transformations in VSCode using Jest test debugging. Here is how:

1. Create a `.vscode/launch.json` file in the root of the repo.
2. Paste the following in

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug Codemod Jest Test",
            "type": "node",
            "request": "launch",
            "cwd": "${workspaceRoot}/tools/codemods",
            "runtimeArgs": [
                "--inspect-brk",
                "${workspaceRoot}/tools/codemods/node_modules/jest/bin/jest.js",
                "--runInBand",
                "--testPathPattern=${fileBasenameNoExtension}"
            ],
            "console": "integratedTerminal",
            "internalConsoleOptions": "neverOpen",
            "port": 9229
        }
    ]
}
```

3. Select a unit test file you want to debug.
4. Go to Run and Debug and run the `Debug Codemod Jest Test` configuration.
5. The debugger will start and you will be able to place breakpoints in the transformations, step the code, etc.
