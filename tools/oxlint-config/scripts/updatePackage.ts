// (C) 2025-2026 GoodData Corporation

import { readFileSync, writeFileSync } from "fs";

import { common, variants } from "../src/index.js";

const packageJson = JSON.parse(readFileSync("./package.json").toString()) as {
    exports: Record<string, string>;
    devDependencies: Record<string, string>;
    peerDependencies: Record<string, string>;
};

// explicitly grab packages which are required, but not linked to any configurations
const devDeps: Record<string, string> = {
    "@gooddata/lint-config": packageJson.devDependencies["@gooddata/lint-config"],
    oxlint: packageJson.devDependencies["oxlint"],
    oxfmt: packageJson.devDependencies["oxfmt"],
    "@types/node": packageJson.devDependencies["@types/node"],
    jiti: "2.6.1", // Required for ESLint to load TypeScript config files
    typescript: packageJson.devDependencies["typescript"],
    "@typescript/native-preview": "7.0.0-dev.20260202.1",
    "vite-node": packageJson.devDependencies["vite-node"],
    "@gooddata/eslint-config": packageJson.devDependencies["@gooddata/eslint-config"],
    "@eslint/js": packageJson.devDependencies["@eslint/js"],
    "@typescript-eslint/eslint-plugin": packageJson.devDependencies["@typescript-eslint/eslint-plugin"],
    "@typescript-eslint/parser": packageJson.devDependencies["@typescript-eslint/parser"],
    eslint: packageJson.devDependencies["eslint"],
    "eslint-import-resolver-typescript": packageJson.devDependencies["eslint-import-resolver-typescript"],
    "eslint-plugin-headers": packageJson.devDependencies["eslint-plugin-headers"],
    "eslint-plugin-import-esm": packageJson.devDependencies["eslint-plugin-import-esm"],
    "eslint-plugin-import-x": packageJson.devDependencies["eslint-plugin-import-x"],
    "eslint-plugin-no-barrel-files": packageJson.devDependencies["eslint-plugin-no-barrel-files"],
    "eslint-plugin-sonarjs": packageJson.devDependencies["eslint-plugin-sonarjs"],
    globals: packageJson.devDependencies["globals"],
};
const peers: Record<string, string> = { oxlint: devDeps.oxlint };

for (const configuration of common) {
    for (const pkg of configuration.packages ?? []) {
        peers[pkg.name] = pkg.version;
        devDeps[pkg.name] = pkg.version;
    }
}

// add variant packages to devDeps
for (const variant of Object.values(variants)) {
    for (const configuration of variant) {
        for (const pkg of configuration.packages ?? []) {
            devDeps[pkg.name] = pkg.version;
        }
    }
}

const peerKeys = Object.keys(peers).sort((a, b) => a.localeCompare(b));
const devDepsKeys = Object.keys(devDeps).sort((a, b) => a.localeCompare(b));

packageJson.peerDependencies = {};
packageJson.devDependencies = {};

for (const key of peerKeys) {
    packageJson.peerDependencies[key] = peers[key];
}
for (const key of devDepsKeys) {
    packageJson.devDependencies[key] = devDeps[key];
}

packageJson.exports = {
    ".": "./dist/base.json",
    ...Object.fromEntries(
        Object.keys(variants).map((variantName) => [`./${variantName}`, `./dist/${variantName}.json`]),
    ),
};

writeFileSync("./package.json", JSON.stringify(packageJson, null, 4));
