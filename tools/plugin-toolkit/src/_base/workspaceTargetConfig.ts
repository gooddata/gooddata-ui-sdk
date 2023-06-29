// (C) 2021-2022 GoodData Corporation

import ora from "ora";

import { ActionOptions, TargetBackendType } from "./types.js";
import {
    BackendCredentials,
    createCredentialsFromEnv,
    completeCredentialsOrDie,
    validateCredentialsComplete,
    promptCredentials,
} from "./credentials.js";
import { discoverBackendType, readPackageJsonIfExists } from "./utils.js";
import {
    getBackendFromOptions,
    getHostnameFromOptions,
    getWorkspaceFromOptions,
} from "./inputHandling/extractors.js";
import { loadEnv } from "./env.js";
import { createHostnameValidator, validOrDie } from "./inputHandling/validators.js";
import { createBackend } from "./backend.js";
import { promptBackend, promptHostname, promptWorkspaceId } from "./terminal/prompts.js";

/**
 * Config for commands that target a workspace.
 */
export type WorkspaceTargetConfig = {
    /**
     * Backend type
     */
    backend: TargetBackendType;

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

function createOrPromptCredentials(
    backend: TargetBackendType,
    env: Record<string, string>,
): Promise<BackendCredentials> {
    const credentialsFromEnv = createCredentialsFromEnv(env);
    const areCredentialsValid = !validateCredentialsComplete(backend, credentialsFromEnv);
    if (areCredentialsValid) {
        return Promise.resolve(credentialsFromEnv);
    }

    return promptCredentials(backend);
}

async function promptWorkspace(
    backend: TargetBackendType,
    hostname: string,
    credentials: BackendCredentials,
): Promise<string> {
    const backendInstance = createBackend({
        hostname,
        backend,
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

    const backendFromOptions = getBackendFromOptions(options);
    const backend = backendFromOptions ?? discoverBackendType(packageJson) ?? (await promptBackend());

    const env = loadEnv(backend);

    const credentials = await createOrPromptCredentials(backend, env);
    completeCredentialsOrDie(backend, credentials);

    const hostnameFromOptions = getHostnameFromOptions(backendFromOptions, options);
    const hostname = hostnameFromOptions ?? env.BACKEND_URL ?? (await promptHostname(backend));
    validOrDie("hostname", hostname, createHostnameValidator(backend));

    const workspaceFromOptions = getWorkspaceFromOptions(options);
    const workspace =
        workspaceFromOptions ?? env.WORKSPACE ?? (await promptWorkspace(backend, hostname, credentials));

    return {
        backend,
        hostname,
        workspace,
        credentials,
        env,
        packageJson,
    };
}
