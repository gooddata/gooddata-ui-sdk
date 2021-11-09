// (C) 2021 GoodData Corporation

import { ActionOptions, TargetBackendType } from "./types";
import { BackendCredentials, createCredentialsFromEnv, validateCredentialsAreComplete } from "./credentials";
import { discoverBackendType, readJsonSync } from "./utils";
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
     * For completeness includes package.json of the current project. The package.json was used to
     * determine backend type however it is included here due to anticipation that the command may
     * need more info from it.
     */
    packageJson: Record<string, any>;
};

/**
 * Creates common config for commands that target a workspace. This function perform no validation
 * at all on purpose - whoever gets the workspace config may need to do more work and more validations
 * and perhaps needs to do them in different order or who knows... one day we can make this async and
 * do all the essential validations here instead.
 *
 * See {@link validateWorkspaceTargetConfig} to trigger available client-side validations.
 *
 * @param options
 */
export function createWorkspaceTargetConfig(options: ActionOptions): WorkspaceTargetConfig {
    const packageJson = readJsonSync("package.json");
    const backendFromOptions = getBackendFromOptions(options);
    const backend = backendFromOptions ?? discoverBackendType(packageJson);
    const env = loadEnv(backend);
    const hostnameFromOptions = getHostnameFromOptions(backendFromOptions, options);
    const workspaceFromOptions = getWorkspaceFromOptions(options);
    const hostname = hostnameFromOptions ?? env.BACKEND_URL;
    const workspace = workspaceFromOptions ?? env.WORKSPACE;
    const credentials = createCredentialsFromEnv(env);

    return {
        backend,
        hostname,
        workspace,
        credentials,
        env,
        packageJson,
    };
}

export function validateWorkspaceTargetConfig(config: WorkspaceTargetConfig): void {
    const { hostname, backend, credentials } = config;

    validOrDie("hostname", hostname, createHostnameValidator(backend));
    validateCredentialsAreComplete(backend, credentials);
}
