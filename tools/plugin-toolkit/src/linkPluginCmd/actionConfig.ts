// (C) 2021 GoodData Corporation
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig";
import { IAnalyticalBackend, IDashboardPlugin, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { ActionOptions } from "../_base/types";
import { createBackend } from "../_base/backend";
import { getDashboardFromOptions } from "../_base/inputHandling/extractors";
import ora from "ora";
import {
    asyncValidOrDie,
    createDashboardPluginValidator,
    createDashboardValidator,
    createWorkspaceValidator,
    InputValidator,
} from "../_base/inputHandling/validators";
import isEmpty from "lodash/isEmpty";
import { promptPluginParameters } from "../_base/terminal/prompts";
import { logError } from "../_base/terminal/loggers";
import { convertToPluginEntrypoint, convertToPluginIdentifier } from "../_base/utils";

export type LinkCmdActionConfig = WorkspaceTargetConfig & {
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
    withParameters: boolean;
    parameters: string | undefined;
    backendInstance: IAnalyticalBackend;
};

function createDuplicatePluginLinkValidator(
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
            return true;
        }

        if (plugins.some((plugin) => plugin.identifier === identifier)) {
            return (
                `Dashboard ${dashboard.identifier} already uses plugin ${identifier}. ` +
                "Dashboard can only link each plugin once. Consider using parameterization instead."
            );
        }

        const otherPluginWithSameEp = plugins.find((plugin) => plugin.url.endsWith(entryPoint));
        if (otherPluginWithSameEp) {
            const { identifier: otherIdentifier, name } = otherPluginWithSameEp;

            return (
                `Dashboard ${dashboard.identifier} is already linked with another plugin (${otherIdentifier} - ${name})` +
                "that has same entry point as the plugin that you want to link now. This is likely another version of " +
                "the same plugin. Adding two versions of the same plugin is not supported. Note: " +
                "renaming the entry point files will not help as you will then encounter load-time errors."
            );
        }

        return true;
    };
}

function createLinkedPluginUrlValidator(pluginIdentifier: string): InputValidator<IDashboardPlugin> {
    const entryPoint = convertToPluginEntrypoint(pluginIdentifier);

    return (plugin) => {
        if (!plugin.url.endsWith(entryPoint)) {
            return (
                `You are trying to link a plugin (${plugin.name}) whose entry point differs from the ` +
                "entry point of the plugin in your current directory."
            );
        }

        return true;
    };
}

async function doAsyncValidations(config: LinkCmdActionConfig) {
    const { backendInstance, workspace, dashboard, identifier, pluginIdentifier } = config;

    const asyncValidationProgress = ora({
        text: "Performing server-side validations.",
    });
    try {
        asyncValidationProgress.start();

        await backendInstance.authenticate(true);
        await asyncValidOrDie("workspace", workspace, createWorkspaceValidator(backendInstance));
        await asyncValidOrDie(
            "dashboardPlugin",
            identifier,
            createDashboardPluginValidator(
                backendInstance,
                workspace,
                createLinkedPluginUrlValidator(pluginIdentifier),
            ),
        );
        await asyncValidOrDie(
            "dashboard",
            dashboard,
            createDashboardValidator(
                backendInstance,
                workspace,
                createDuplicatePluginLinkValidator(identifier, pluginIdentifier),
            ),
        );
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getLinkCmdActionConfig(
    identifier: string,
    options: ActionOptions,
): Promise<LinkCmdActionConfig> {
    const workspaceTargetConfig = createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials, env, packageJson } = workspaceTargetConfig;
    const dashboard = getDashboardFromOptions(options) ?? env.DASHBOARD;

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: LinkCmdActionConfig = {
        ...workspaceTargetConfig,
        identifier,
        dashboard,
        pluginIdentifier: convertToPluginIdentifier(packageJson.name),
        dryRun: options.commandOpts.dryRun ?? false,
        withParameters: options.commandOpts.withParameters ?? false,
        parameters: undefined,
        backendInstance,
    };

    await doAsyncValidations(config);

    if (config.withParameters) {
        const parameters = await promptPluginParameters();

        if (isEmpty(parameters.trim())) {
            logError(
                "You did not specify any parameters. If you do not want to use plugin parameterization, remove the --with-parameters option.",
            );

            process.exit(1);
        } else {
            config.parameters = parameters;
        }
    }

    return config;
}
