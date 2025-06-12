# Skeletons

These are skeleton projects that can be used to bootstrap a new SDK package. You can use the
attached [create-new-lib.sh](create-new-lib.sh) script to bootstrap a new package:

```bash
cd skel
./create-new-lib.sh ts my-new-lib
```

This will bootstrap a new project in libs directory and a new project entry to `rush.json`,
execute `rush update` and then commit all the new files and changes.

Alternatively, if you would like to create a new non-production tooling, use [create-new-tool.sh](create-new-tool.sh)

## sdk-skel-ts

Pure TypeScript project. Vitest for testing.

Use this for new headless libraries.

## sdk-skel-tsx

TypeScript + React project. Vitest, React Testing Library and Storybook for testing.

Use this for new UI components.
