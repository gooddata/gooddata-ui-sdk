// (C) 2021-2022 GoodData Corporation

import { ActionOptions } from "./types.js";

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
export async function createWorkspaceTargetConfig(_options: ActionOptions): Promise<WorkspaceTargetConfig> {
    const packageJson = readPackageJsonIfExists();

    return {
        packageJson,
    };
}
