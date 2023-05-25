// (C) 2022 GoodData Corporation

import { IAnalyticalBackend, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, idRef } from "@gooddata/sdk-model";
import isEmpty from "lodash/isEmpty.js";
import ora from "ora";
import { createBackend } from "../_base/backend.js";
import { getDashboardFromOptions } from "../_base/inputHandling/extractors.js";
import {
    asyncValidOrDie,
    createDashboardPluginValidator,
    createDashboardValidator,
    createWorkspaceValidator,
    InputValidator,
} from "../_base/inputHandling/validators.js";
import { logError } from "../_base/terminal/loggers.js";
import { promptDashboardIdWithoutChoice, promptPluginParameters } from "../_base/terminal/prompts.js";
import { ActionOptions } from "../_base/types.js";
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig.js";

export type UpdatePluginParamsCmdConfig = WorkspaceTargetConfig & {
    /**
     * Plugin _metadata object_ identifier.
     */
    identifier: string;
    dashboard: string;
    dryRun: boolean;
    parameters: string | undefined;
    backendInstance: IAnalyticalBackend;
};

function createPluginExistsValidator(identifier: string): InputValidator<IDashboardWithReferences> {
    return (dashboardWithReferences) => {
        const {
            references: { plugins },
        } = dashboardWithReferences;

        if (isEmpty(plugins)) {
            return false;
        }

        return plugins.some((plugin) => plugin.identifier === identifier);
    };
}

async function getOriginalParameters(config: UpdatePluginParamsCmdConfig) {
    const { backendInstance, workspace, dashboard, identifier } = config;

    const fetchOriginalParametersProgress = ora({
        text: "Fetching original parameters.",
    });

    try {
        fetchOriginalParametersProgress.start();

        const dashboardObject = await backendInstance
            .workspace(workspace)
            .dashboards()
            .getDashboard(idRef(dashboard));
        const referencedObjects = await backendInstance
            .workspace(workspace)
            .dashboards()
            .getDashboardReferencedObjects(dashboardObject, ["dashboardPlugin"]);

        const referencedPlugin = referencedObjects.plugins.find((plugin) => plugin.identifier === identifier);

        const plugin = dashboardObject.plugins?.find((plugin) =>
            areObjRefsEqual(plugin.plugin, referencedPlugin?.ref),
        );

        return plugin?.parameters;
    } finally {
        fetchOriginalParametersProgress.stop();
    }
}

async function doAsyncValidations(config: UpdatePluginParamsCmdConfig) {
    const { backendInstance, workspace, dashboard, identifier } = config;

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
            createDashboardPluginValidator(backendInstance, workspace),
        );
        await asyncValidOrDie(
            "dashboard",
            dashboard,
            createDashboardValidator(backendInstance, workspace, createPluginExistsValidator(identifier)),
        );
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getUpdatePluginParamsCmdConfig(
    identifier: string,
    options: ActionOptions,
): Promise<UpdatePluginParamsCmdConfig> {
    const workspaceTargetConfig = await createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials, env } = workspaceTargetConfig;

    const dashboard =
        getDashboardFromOptions(options) ??
        env.DASHBOARD_ID ??
        (await promptDashboardIdWithoutChoice("Enter identifier of the dashboard to link the plugin to:"));

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: UpdatePluginParamsCmdConfig = {
        ...workspaceTargetConfig,
        identifier,
        dashboard,
        dryRun: options.commandOpts.dryRun ?? false,
        parameters: undefined,
        backendInstance,
    };

    await doAsyncValidations(config);

    const originalParameters = await getOriginalParameters(config);
    const parameters = await promptPluginParameters(originalParameters);

    if (isEmpty(parameters.trim())) {
        logError("You did not specify any parameters to be updated on the plugin.");

        process.exit(1);
    } else {
        config.parameters = parameters;
    }

    return config;
}
