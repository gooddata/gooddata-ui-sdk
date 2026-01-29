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
    eslint: packageJson.devDependencies["eslint"],
    "@types/node": packageJson.devDependencies["@types/node"],
    typescript: packageJson.devDependencies["typescript"],
    "vite-node": packageJson.devDependencies["vite-node"],
};
const peers: Record<string, string> = { eslint: devDeps.eslint };

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
    "./tsOverride": "./dist/tsOverride.cjs",
};

writeFileSync("./package.json", JSON.stringify(packageJson, null, 4));
