// (C) 2026 GoodData Corporation

"use strict";

// baseline-browser-mapping needs to be updated to the latest version every 14 days
const baselineBrowserMappingVersion = "2.11.21";

// browserslist needs to be updated every 6 months
const browserslistVersion = "4.28.9";

// TS 7 moved the compiler API to typescript/unstable/*; require("typescript") now returns only
// { version, versionMajorMinor }. Everything that consumes the API needs the classic package, so the
// lint stack gets its own pinned TS 6 copy while the projects keep typescript 7.x for tsc.
// This MUST stay one exact version: the parser hands ts.Type objects to the plugins, and pnpm only
// shares a module instance between packages resolved to the identical version.
const lintTypescriptVersion = "6.0.3";

const lintTypescriptConsumers = [
    "eslint-plugin-sonarjs",
    "ts-api-utils",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "@typescript-eslint/project-service",
    "@typescript-eslint/tsconfig-utils",
    "@typescript-eslint/type-utils",
    "@typescript-eslint/typescript-estree",
    "@typescript-eslint/utils",
];

/**
 * When using the PNPM package manager, you can use pnpmfile.js to workaround
 * dependencies that have mistakes in their package.json file.  (This feature is
 * functionally similar to Yarn's "resolutions".)
 *
 * For details, see the PNPM documentation:
 * https://pnpm.js.org/docs/en/hooks.html
 *
 * IMPORTANT: SINCE THIS FILE CONTAINS EXECUTABLE CODE, MODIFYING IT IS LIKELY TO INVALIDATE
 * ANY CACHED DEPENDENCY ANALYSIS.  After any modification to pnpmfile.js, it's recommended to run
 * "rush update --full" so that PNPM will recalculate all version selections.
 */
module.exports = {
    hooks: {
        readPackage,
    },
};

/**
 * This hook is invoked during installation before a package's dependencies
 * are selected.
 * The `packageJson` parameter is the deserialized package.json
 * contents for the package that is about to be installed.
 * The `context` parameter provides a log() function.
 * The return value is the updated object.
 */
function readPackage(packageJson, context) {
    if (packageJson.dependencies && packageJson.dependencies["baseline-browser-mapping"]) {
        //context.log("Fixed up dependencies for baseline-browser-mapping");
        packageJson.dependencies["baseline-browser-mapping"] = baselineBrowserMappingVersion;
    }

    if (packageJson.devDependencies && packageJson.devDependencies["baseline-browser-mapping"]) {
        //context.log("Fixed up dependencies for baseline-browser-mapping");
        packageJson.devDependencies["baseline-browser-mapping"] = baselineBrowserMappingVersion;
    }

    if (packageJson.dependencies && packageJson.dependencies["browserslist"]) {
        //context.log("Fixed up dependencies for browserslist");
        packageJson.dependencies["browserslist"] = browserslistVersion;
    }

    if (packageJson.devDependencies && packageJson.devDependencies["browserslist"]) {
        //context.log("Fixed up dependencies for browserslist");
        packageJson.devDependencies["browserslist"] = browserslistVersion;
    }

    /*
        remove it when @openapitools/openapi-generator-cli update its dependency concurrently
        @openapitools/openapi-generator-cli 2.34.0
        └─┬ concurrently 9.2.1
          └── shell-quote 1.8.3
    */
    if (packageJson.dependencies && packageJson.dependencies["shell-quote"]) {
        //context.log("Fixed up dependencies for shell-quote");
        packageJson.dependencies["shell-quote"] = "1.8.4";
    }

    if (packageJson.name === "@gooddata/fixtures") {
        delete packageJson.dependencies["@gooddata/api-client-bear"];
    }

    // TypeScript peers
    if (packageJson.name === "@module-federation/dts-plugin" && packageJson.peerDependencies["typescript"]) {
        //context.log("Fixed up dependencies for " + packageJson.name);
        packageJson.peerDependencies["typescript"] = "^7.0.0";
    }

    // linter-related TypeScript overrides
    if (lintTypescriptConsumers.includes(packageJson.name)) {
        // Pin the lint toolchain to the classic TypeScript API. typescript is a peer on every one of
        // these except eslint-plugin-sonarjs, so it is converted into a real dependency — a widened peer
        // range would still resolve to the consuming project's typescript 7.x. Peer resolution cascades,
        // so children (ts-api-utils, typescript-estree, ...) re-key onto the same TS 6 instance.

        // tsconfig-utils and ts-api-utils ship no dependencies field at all.
        packageJson.dependencies = {
            ...packageJson.dependencies,
            typescript: lintTypescriptVersion,
        };

        if (packageJson.peerDependencies) {
            delete packageJson.peerDependencies["typescript"];
        }
        if (packageJson.peerDependenciesMeta) {
            delete packageJson.peerDependenciesMeta["typescript"];
        }
    }

    return packageJson;
}
