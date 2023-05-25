// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { convertToPluginIdentifier } from "../_base/utils.js";
import {
    asyncValidOrDie,
    createPluginUrlValidator,
    createWorkspaceValidator,
} from "../_base/inputHandling/validators.js";
import { createBackend } from "../_base/backend.js";
import ora from "ora";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig.js";

export type AddCmdActionConfig = WorkspaceTargetConfig & {
    pluginUrl: string;
    pluginIdentifier: string;
    pluginName: string;
    pluginDescription: string | undefined;

    dryRun: boolean;
    backendInstance: IAnalyticalBackend;
};

/**
 * Perform asynchronous validations:
 *
 * -  backend & authentication against it
 * -  workspace exists
 * -  plugin is valid and entry point exists at the provided location
 */
async function doAsyncValidations(config: AddCmdActionConfig) {
    const { backendInstance, workspace, pluginUrl, pluginIdentifier } = config;

    const asyncValidationProgress = ora({
        text: "Performing server-side validations.",
    });
    try {
        asyncValidationProgress.start();

        await backendInstance.authenticate(true);
        await asyncValidOrDie("workspace", workspace, createWorkspaceValidator(backendInstance));
        await asyncValidOrDie("pluginUrl", pluginUrl, createPluginUrlValidator(pluginIdentifier));
    } finally {
        asyncValidationProgress.stop();
    }
}

/**
 * Get the best guess of the original plugin name from ints entry point URL.
 *
 * @param url - the URL of the plugin being added
 */
function pluginUrlToPluginName(url: string): string {
    const match = /dp_([^/]+).js$/i.exec(url);
    return match?.[1] ?? "";
}

export async function getAddCmdActionConfig(
    pluginUrl: string,
    options: ActionOptions,
): Promise<AddCmdActionConfig> {
    const workspaceTargetConfig = await createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials, packageJson } = workspaceTargetConfig;

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    /*
     * In case we are not running this from the original plugin directory, derive a best-guess name from
     * the plugin URL. This is good enough for most cases and is easier than asking the user to provide
     * a valid name that would match the URL and pass subsequent validations.
     */
    const pluginName = packageJson.name ?? pluginUrlToPluginName(pluginUrl);

    const config: AddCmdActionConfig = {
        ...workspaceTargetConfig,
        pluginUrl,
        pluginName,
        pluginIdentifier: convertToPluginIdentifier(pluginName),
        pluginDescription: packageJson.description,
        dryRun: options.commandOpts.dryRun ?? false,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
