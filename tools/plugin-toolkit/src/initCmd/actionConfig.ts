// (C) 2021-2024 GoodData Corporation
import { ActionOptions, SupportedPackageManager, TargetAppLanguage } from "../_base/types.js";
import {
    createHostnameValidator,
    languageValidator,
    packageManagerValidator,
    pluginNameValidator,
    validOrDie,
} from "../_base/inputHandling/validators.js";
import {
    promptDashboardIdWithoutChoice,
    promptHostname,
    promptLanguage,
    promptName,
    promptWorkspaceIdWithoutChoice,
} from "../_base/terminal/prompts.js";
import {
    getDashboardFromOptions,
    getHostnameFromOptions,
    getWorkspaceFromOptions,
} from "../_base/inputHandling/extractors.js";
import { convertToPluginIdentifier } from "../_base/utils.js";

function getLanguageFromOptions(options: ActionOptions): TargetAppLanguage | undefined {
    const { language } = options.commandOpts;

    if (!language) {
        return undefined;
    }

    validOrDie("language", language, languageValidator);

    return language as TargetAppLanguage;
}

function getPackageManagerFromOptions(options: ActionOptions): SupportedPackageManager {
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

    const hostnameFromOptions = getHostnameFromOptions(options);
    const languageFromOptions = getLanguageFromOptions(options);
    const workspaceFromOptions = getWorkspaceFromOptions(options);
    const dashboardFromOptions = getDashboardFromOptions(options);
    const packageManagerFromOptions = getPackageManagerFromOptions(options);
    const name = pluginName ?? (await promptName());
    const hostname = hostnameFromOptions ?? (await promptHostname());
    const language = languageFromOptions ?? (await promptLanguage());
    const workspace = workspaceFromOptions ?? (await promptWorkspaceIdWithoutChoice());
    const dashboard =
        dashboardFromOptions ??
        (await promptDashboardIdWithoutChoice(
            "Enter identifier of a dashboard to use during plugin development:",
        ));

    // validate hostname once again; this is to catch the case when hostname is provided as
    // option but the backend is not and user is prompted for it. the user may select backend
    // for which the protocol used in the hostname is not valid
    validOrDie("hostname", hostname, createHostnameValidator());

    return {
        name,
        pluginIdentifier: convertToPluginIdentifier(name),
        hostname,
        workspace,
        dashboard,
        language,
        packageManager: packageManagerFromOptions,
        targetDir: options.commandOpts.targetDir,
        skipInstall: options.commandOpts.skipInstall ?? false,
    };
}
