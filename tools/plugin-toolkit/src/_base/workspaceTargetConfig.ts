// (C) 2021-2024 GoodData Corporation

import ora from "ora";

import { ActionOptions } from "./types.js";
import {
    BackendCredentials,
    createCredentialsFromEnv,
    completeCredentialsOrDie,
    validateCredentialsComplete,
    promptCredentials,
} from "./credentials.js";
import { readPackageJsonIfExists } from "./utils.js";
import { getHostnameFromOptions, getWorkspaceFromOptions } from "./inputHandling/extractors.js";
import { loadEnv } from "./env.js";
import { createHostnameValidator, validOrDie } from "./inputHandling/validators.js";
import { createBackend } from "./backend.js";
import { promptHostname, promptWorkspaceId } from "./terminal/prompts.js";

/**
 * Config for commands that target a workspace.
 */
export type WorkspaceTargetConfig = {
    /**
     * Hostname where analytical backend lives
     */
    hostname: string;

    /**
     * Workspace to target
     */
    workspace: string;

    /**
     * All available credentials.
     */
    credentials: BackendCredentials;

    /**
     * For completes includes the full env that was loaded from .env, .env.secrets and overlaid with
     * credential-specific env variables that were available on the session level
     */
    env: Record<string, string>;

    /**
     * For completeness includes package.json of the current project. May be an empty object in case CLI
     * is invoked from directory that does not contain package.json
     */
    packageJson: Record<string, any>;
};

function createOrPromptCredentials(env: Record<string, string>): Promise<BackendCredentials> {
    const credentialsFromEnv = createCredentialsFromEnv(env);
    const areCredentialsValid = !validateCredentialsComplete(credentialsFromEnv);
    if (areCredentialsValid) {
        return Promise.resolve(credentialsFromEnv);
    }

    return promptCredentials();
}

async function promptWorkspace(hostname: string, credentials: BackendCredentials): Promise<string> {
    const backendInstance = createBackend({
        hostname,
        credentials,
    });

    const workspaceLoadingProgress = ora({
        text: "Loading workspaces.",
    });

    try {
        workspaceLoadingProgress.start();
        const workspacesFirstPage = await backendInstance.workspaces().forCurrentUser().query();
        const allWorkspaces = await workspacesFirstPage.all();
        const descriptors = await Promise.all(allWorkspaces.map((ws) => ws.getDescriptor()));
        workspaceLoadingProgress.stop();

        return promptWorkspaceId(
            descriptors.map((ws) => ({
                name: ws.title ?? ws.id,
                value: ws.id,
            })),
        );
    } catch (e: any) {
        workspaceLoadingProgress.fail(e.message ?? "Error loading workspaces");
        throw e;
    }
}

/**
 * Creates common config for commands that target a workspace.
 */
export async function createWorkspaceTargetConfig(options: ActionOptions): Promise<WorkspaceTargetConfig> {
    const packageJson = readPackageJsonIfExists();

    const env = loadEnv();

    const credentials = await createOrPromptCredentials(env);
    completeCredentialsOrDie(credentials);

    const hostnameFromOptions = getHostnameFromOptions(options);
    const hostname = hostnameFromOptions ?? env.BACKEND_URL ?? (await promptHostname());
    validOrDie("hostname", hostname, createHostnameValidator());

    const workspaceFromOptions = getWorkspaceFromOptions(options);
    const workspace = workspaceFromOptions ?? env.WORKSPACE ?? (await promptWorkspace(hostname, credentials));

    return {
        hostname,
        workspace,
        credentials,
        env,
        packageJson,
    };
}
