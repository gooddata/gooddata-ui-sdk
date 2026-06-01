#!/usr/bin/env node
// (C) 2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files -- this file IS the package's curated public surface */

import { realpathSync } from "fs";
import { fileURLToPath } from "url";

import { runProfile, runProfileWithAnswers } from "./engine/runProfile.js";
import { clientProfile } from "./profiles/client.js";

// Engine API for external profile authors (e.g. gdc-ui's internal scaffolder).
// Anything re-exported here is part of the public surface of @gooddata/create-pluggable-module.
export { runProfile, runProfileWithAnswers, clientProfile };
export type {
    ApplicationScope,
    IDerivedValues,
    IOverlayPath,
    IProfileContext,
    IPromptDescriptor,
    IRegistrationStep,
    IRepoInfo,
    IScaffoldAnswers,
    IScaffoldProfile,
    PackageManager,
    ProfileName,
    TokenReplacements,
} from "./types.js";
export { ensureTrailingCommaBeforeAnchor } from "./engine/jsonAnchors.js";
export { fullAnchor, findAnchorLineIdx, insertBeforeAnchor, ANCHOR_KEYWORD } from "./engine/anchors.js";
export {
    computeRoute,
    computeFederationName,
    computeRemoteUrlEnvVar,
    computeDevPort,
    getOwnPackageVersion,
} from "./engine/derived.js";
export { runCommand, installCommand } from "./engine/spawn.js";
export { validateTextValue } from "./engine/prompts.js";

// CLI entry — only ships the client profile. Internal/private scaffolders are
// expected to import `runProfile` programmatically and supply their own profile.
async function main(): Promise<void> {
    const argv = process.argv.slice(2);
    if (argv.includes("--help") || argv.includes("-h")) {
        printHelp();
        return;
    }
    await runProfile(clientProfile);
}

function printHelp(): void {
    console.log(`
  @gooddata/create-pluggable-module — scaffold a new GoodData pluggable application.

  Usage:
    npm init @gooddata/pluggable-module

  Flags:
    --help, -h      Print this help and exit.

  Programmatic API:
    import { runProfile, clientProfile, type IScaffoldProfile } from "@gooddata/create-pluggable-module";
    await runProfile(yourCustomProfile);
`);
}

// Only run the CLI when this file is the entry point (allows library use too).
// `process.argv[1]` is the script path Node was invoked with — when this file is
// installed as a bin, that's actually a symlink in node_modules/.bin/ pointing
// here. Compare the realpath against this module's file URL so symlinked
// invocation (npx, npm install -g, npm init …) still detects entry-point use.
function isCliInvocation(): boolean {
    const argv1 = process.argv[1];
    if (!argv1) return false;
    try {
        return fileURLToPath(import.meta.url) === realpathSync(argv1);
    } catch {
        return false;
    }
}
if (isCliInvocation()) {
    main().catch((err: unknown) => {
        console.error(err);
        process.exit(1);
    });
}
