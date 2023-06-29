// (C) 2021-2022 GoodData Corporation
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig.js";
import { IAnalyticalBackend, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { ActionOptions } from "../_base/types.js";
import { createBackend } from "../_base/backend.js";
import { getDashboardFromOptions } from "../_base/inputHandling/extractors.js";
import ora from "ora";
import {
    asyncValidOrDie,
    createDashboardValidator,
    createWorkspaceValidator,
    InputValidator,
} from "../_base/inputHandling/validators.js";
import isEmpty from "lodash/isEmpty.js";
import { convertToPluginEntrypoint, convertToPluginIdentifier } from "../_base/utils.js";
import { promptDashboardIdWithoutChoice } from "../_base/terminal/prompts.js";

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

        // if the pluginIdentifier is not available, we are running the tool outside of the original plugin
        // directory so the entry point validation is impossible
        const entryPoint = convertToPluginEntrypoint(pluginIdentifier);
        if (pluginIdentifier && !linkedPlugin.url.endsWith(entryPoint)) {
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
    const workspaceTargetConfig = await createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials, env, packageJson } = workspaceTargetConfig;
    const dashboard =
        getDashboardFromOptions(options) ??
        env.DASHBOARD_ID ??
        (await promptDashboardIdWithoutChoice(
            "Enter identifier of the dashboard to unlink the plugin from:",
        ));

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: UnlinkCmdActionConfig = {
        ...workspaceTargetConfig,
        identifier,
        pluginIdentifier: packageJson.name && convertToPluginIdentifier(packageJson.name),
        dashboard,
        dryRun: options.commandOpts.dryRun ?? false,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
