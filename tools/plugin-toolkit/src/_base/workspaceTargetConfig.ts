// (C) 2021-2022 GoodData Corporation

import { ActionOptions, TargetBackendType } from "./types";
import {
    BackendCredentials,
    createCredentialsFromEnv,
    completeCredentialsOrDie,
    validateCredentialsComplete,
    promptCredentials,
} from "./credentials";
import { discoverBackendTypeOrDie, readPackageJsonIfExists } from "./utils";
import {
    getBackendFromOptions,
    getHostnameFromOptions,
    getWorkspaceFromOptions,
} from "./inputHandling/extractors";
import { loadEnv } from "./env";
import { createHostnameValidator, validOrDie } from "./inputHandling/validators";

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

/**
 * Creates common config for commands that target a workspace.
 */
export async function createWorkspaceTargetConfig(options: ActionOptions): Promise<WorkspaceTargetConfig> {
    const packageJson = readPackageJsonIfExists();
    const backendFromOptions = getBackendFromOptions(options);
    const backend = backendFromOptions ?? discoverBackendTypeOrDie(packageJson);
    const env = loadEnv(backend);
    const hostnameFromOptions = getHostnameFromOptions(backendFromOptions, options);
    const workspaceFromOptions = getWorkspaceFromOptions(options);
    const hostname = hostnameFromOptions ?? env.BACKEND_URL;
    const workspace = workspaceFromOptions ?? env.WORKSPACE;

    validOrDie("hostname", hostname, createHostnameValidator(backend));

    const credentials = await createOrPromptCredentials(backend, env);

    completeCredentialsOrDie(backend, credentials);

    return {
        backend,
        hostname,
        workspace,
        credentials,
        env,
        packageJson,
    };
}
