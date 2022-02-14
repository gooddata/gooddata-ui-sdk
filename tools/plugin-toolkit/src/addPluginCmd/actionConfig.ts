// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { convertToPluginIdentifier } from "../_base/utils";
import {
    asyncValidOrDie,
    createPluginUrlValidator,
    createWorkspaceValidator,
} from "../_base/inputHandling/validators";
import { createBackend } from "../_base/backend";
import ora from "ora";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig";

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

    const config: AddCmdActionConfig = {
        ...workspaceTargetConfig,
        pluginUrl,
        pluginIdentifier: convertToPluginIdentifier(packageJson.name),
        pluginName: packageJson.name,
        pluginDescription: packageJson.description,
        dryRun: options.commandOpts.dryRun ?? false,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
