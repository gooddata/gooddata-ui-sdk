// (C) 2021 GoodData Corporation
import { ActionOptions, SupportedPackageManager, TargetAppLanguage, TargetBackendType } from "../_base/types";
import {
    createHostnameValidator,
    languageValidator,
    packageManagerValidator,
    pluginNameValidator,
    validOrDie,
} from "../_base/inputHandling/validators";
import {
    promptBackend,
    promptDashboardIdWithoutChoice,
    promptHostname,
    promptLanguage,
    promptName,
    promptWorkspaceIdWithoutChoice,
} from "../_base/terminal/prompts";
import { getBackend, getDashboard, getHostname, getWorkspace } from "../_base/inputHandling/extractors";
import { convertToPluginIdentifier } from "../_base/utils";

function getLanguage(options: ActionOptions): TargetAppLanguage | undefined {
    const { language } = options.commandOpts;

    if (!language) {
        return undefined;
    }

    validOrDie("language", language, languageValidator);

    return language as TargetAppLanguage;
}

function getPackageManager(options: ActionOptions): SupportedPackageManager {
    const { packageManager } = options.commandOpts;

    if (!packageManager) {
        return "npm";
    }

    validOrDie("packageManager", packageManager, packageManagerValidator);

    return packageManager as SupportedPackageManager;
}

//
//
//

export type InitCmdActionConfig = {
    name: string;
    pluginIdentifier: string;
    packageManager: SupportedPackageManager;
    backend: TargetBackendType;
    hostname: string;
    workspace: string;
    dashboard: string;
    language: TargetAppLanguage;
    targetDir: string | undefined;
    skipInstall: boolean;
};

/**
 * This function will obtain configuration for the plugin init command. It will do so from the argument
 * and option values passed via CLI and in case vital input is missing by using interactive prompts.
 *
 * The function will first verify all the available options and only then start prompting the user - this
 * is intentional as the CLI should fail fast and not at some arbitrary point after user prompting.
 *
 * @param pluginName - plugin name (if any) as passed by the user, undefined means no plugin name on CLI
 * @param options - program & command level options provided by the user via CLI
 */
export async function getInitCmdActionConfig(
    pluginName: string | undefined,
    options: ActionOptions,
): Promise<InitCmdActionConfig> {
    if (pluginName) {
        validOrDie("plugin-name", pluginName, pluginNameValidator);
    }

    const backendFromOptions = getBackend(options);
    const hostnameFromOptions = getHostname(backendFromOptions, options);
    const languageFromOptions = getLanguage(options);
    const workspaceFromOptions = getWorkspace(options);
    const dashboardFromOptions = getDashboard(options);
    const packageManagerFromOptions = getPackageManager(options);
    const name = pluginName ?? (await promptName());
    const backend = backendFromOptions ?? (await promptBackend());
    const hostname = hostnameFromOptions ?? (await promptHostname(backend));
    const language = languageFromOptions ?? (await promptLanguage());
    const workspace = workspaceFromOptions ?? (await promptWorkspaceIdWithoutChoice());
    const dashboard = dashboardFromOptions ?? (await promptDashboardIdWithoutChoice());

    // validate hostname once again; this is to catch the case when hostname is provided as
    // option but the backend is not and user is prompted for it. the user may select backend
    // for which the protocol used in the hostname is not valid (http on bear)
    validOrDie("hostname", hostname, createHostnameValidator(backend));

    return {
        name,
        pluginIdentifier: convertToPluginIdentifier(name),
        backend,
        hostname,
        workspace,
        dashboard,
        language,
        packageManager: packageManagerFromOptions,
        targetDir: options.commandOpts.targetDir,
        skipInstall: options.commandOpts.skipInstall ?? false,
    };
}
