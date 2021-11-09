// (C) 2021 GoodData Corporation
import {
    createWorkspaceTargetConfig,
    validateWorkspaceTargetConfig,
    WorkspaceTargetConfig,
} from "../_base/workspaceTargetConfig";
import { IAnalyticalBackend, IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
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

export type UseCmdActionConfig = WorkspaceTargetConfig & {
    identifier: string;
    dashboard: string;
    dryRun: boolean;
    backendInstance: IAnalyticalBackend;
};

function createDuplicatePluginLinkValidator(identifier: string): InputValidator<IDashboardWithReferences> {
    return (dashboardWithReferences) => {
        const {
            dashboard,
            references: { plugins },
        } = dashboardWithReferences;
        if (isEmpty(plugins)) {
            return true;
        }

        if (plugins.some((plugin) => plugin.identifier === identifier)) {
            return `Dashboard ${dashboard.identifier} already uses plugin ${identifier}. 
            Dashboard can only use each plugin once. Consider using parameterization instead.`;
        }

        return true;
    };
}

async function doAsyncValidations(config: UseCmdActionConfig) {
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
            createDashboardValidator(
                backendInstance,
                workspace,
                createDuplicatePluginLinkValidator(identifier),
            ),
        );
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getUseCmdActionConfig(
    identifier: string,
    options: ActionOptions,
): Promise<UseCmdActionConfig> {
    const workspaceTargetConfig = createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials, env } = workspaceTargetConfig;
    const dashboard = getDashboardFromOptions(options) ?? env.DASHBOARD;

    validateWorkspaceTargetConfig(workspaceTargetConfig);

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: UseCmdActionConfig = {
        ...workspaceTargetConfig,
        identifier,
        dashboard,
        dryRun: options.commandOpts.dryRun ?? false,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
