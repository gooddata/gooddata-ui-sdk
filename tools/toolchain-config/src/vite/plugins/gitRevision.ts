// (C) 2026 GoodData Corporation

import { type Plugin } from "vite";

import { gitCommitHash } from "../../shared/git.js";

/**
 * Defines `window.COMMITHASH` as the commit the bundle was built from.
 */
export function gitRevisionPlugin(): Plugin {
    const commitHash = gitCommitHash();

    return {
        name: "git-revision",
        config() {
            return {
                define: {
                    "window.COMMITHASH": JSON.stringify(commitHash),
                },
            };
        },
    };
}
