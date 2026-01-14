// (C) 2021-2026 GoodData Corporation

import { type ActionOptions } from "./types.js";
import { readPackageJsonIfExists } from "./utils.js";

/**
 * Config for commands that target a workspace.
 */
export type WorkspaceTargetConfig = {
    /**
     * For completeness includes package.json of the current project. May be an empty object in case CLI
     * is invoked from directory that does not contain package.json
     */
    packageJson: Record<string, any>;
};

/**
 * Creates common config for commands that target a workspace.
 */
export function createWorkspaceTargetConfig(_options: ActionOptions): WorkspaceTargetConfig {
    const packageJson = readPackageJsonIfExists();

    return {
        packageJson,
    };
}
