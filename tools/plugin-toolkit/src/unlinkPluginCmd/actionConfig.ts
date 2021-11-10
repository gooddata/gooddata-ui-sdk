// (C) 2021 GoodData Corporation
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig";
import { IAnalyticalBackend, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { ActionOptions } from "../_base/types";
import { createBackend } from "../_base/backend";
import { getDashboardFromOptions } from "../_base/inputHandling/extractors";
import ora from "ora";
import {
    asyncValidOrDie,
    createDashboardValidator,
    createWorkspaceValidator,
    InputValidator,
} from "../_base/inputHandling/validators";
import isEmpty from "lodash/isEmpty";
import { convertToPluginEntrypoint, convertToPluginIdentifier } from "../_base/utils";

export type UnlinkCmdActionConfig = WorkspaceTargetConfig & {
    /**
     * Plugin _metadata object_ identifier.
     */
    identifier: string;

    /**
     * Plugin identifier (as used in module naming, entry point naming etc)
     */
    pluginIdentifier: string;

    dashboard: string;
    dryRun: boolean;
    backendInstance: IAnalyticalBackend;
};

function createLinkedPluginValidator(
    identifier: string,
    pluginIdentifier: string,
): InputValidator<IDashboardWithReferences> {
    const entryPoint = convertToPluginEntrypoint(pluginIdentifier);

    return (dashboardWithReferences) => {
        const {
            dashboard,
            references: { plugins },
        } = dashboardWithReferences;

        if (isEmpty(plugins)) {
            return `Dashboard ${dashboard.identifier} does not use any plugins.`;
        }

        const linkedPlugin = plugins.find((plugin) => plugin.identifier === identifier);

        if (!linkedPlugin) {
            return `Dashboard ${dashboard.identifier} is not linked with plugin ${identifier}.`;
        }

        if (!linkedPlugin.url.endsWith(entryPoint)) {
            return (
                `You are trying to unlink a plugin (${linkedPlugin.name}) whose entry point differs from the ` +
                "entry point of the plugin in your current directory."
            );
        }

        return true;
    };
}

async function doAsyncValidations(config: UnlinkCmdActionConfig) {
    const { backendInstance, workspace, dashboard, identifier, pluginIdentifier } = config;

    const asyncValidationProgress = ora({
        text: "Performing server-side validations.",
    });
    try {
        asyncValidationProgress.start();

        await backendInstance.authenticate(true);
        await asyncValidOrDie("workspace", workspace, createWorkspaceValidator(backendInstance));
        await asyncValidOrDie(
            "dashboard",
            dashboard,
            createDashboardValidator(
                backendInstance,
                workspace,
                createLinkedPluginValidator(identifier, pluginIdentifier),
            ),
        );
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getUnlinkCmdActionConfig(
    identifier: string,
    options: ActionOptions,
): Promise<UnlinkCmdActionConfig> {
    const workspaceTargetConfig = createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials, env, packageJson } = workspaceTargetConfig;
    const dashboard = getDashboardFromOptions(options) ?? env.DASHBOARD;

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: UnlinkCmdActionConfig = {
        ...workspaceTargetConfig,
        identifier,
        pluginIdentifier: convertToPluginIdentifier(packageJson.name),
        dashboard,
        dryRun: options.commandOpts.dryRun ?? false,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
