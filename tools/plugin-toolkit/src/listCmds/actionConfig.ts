// (C) 2021-2024 GoodData Corporation
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ActionOptions } from "../_base/types.js";
import { createBackend } from "../_base/backend.js";
import ora from "ora";
import { asyncValidOrDie, createWorkspaceValidator } from "../_base/inputHandling/validators.js";

export type ListCmdActionConfig = WorkspaceTargetConfig & {
    backendInstance: IAnalyticalBackend;
};

async function doAsyncValidations(config: ListCmdActionConfig) {
    const { backendInstance, workspace } = config;

    const asyncValidationProgress = ora({
        text: "Authenticating and checking workspace.",
    });
    try {
        asyncValidationProgress.start();

        await backendInstance.authenticate(true);
        await asyncValidOrDie("workspace", workspace, createWorkspaceValidator(backendInstance));
    } finally {
        asyncValidationProgress.stop();
    }
}

export async function getListCmdActionConfig(options: ActionOptions): Promise<ListCmdActionConfig> {
    const workspaceTargetConfig = await createWorkspaceTargetConfig(options);
    const { hostname, credentials } = workspaceTargetConfig;

    const backendInstance = createBackend({
        hostname,
        credentials,
    });

    const config: ListCmdActionConfig = {
        ...workspaceTargetConfig,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
