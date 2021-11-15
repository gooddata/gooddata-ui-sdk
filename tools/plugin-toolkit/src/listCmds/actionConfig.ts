// (C) 2021 GoodData Corporation
import { createWorkspaceTargetConfig, WorkspaceTargetConfig } from "../_base/workspaceTargetConfig";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ActionOptions } from "../_base/types";
import { createBackend } from "../_base/backend";
import ora from "ora";
import { asyncValidOrDie, createWorkspaceValidator } from "../_base/inputHandling/validators";

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
    const workspaceTargetConfig = createWorkspaceTargetConfig(options);
    const { hostname, backend, credentials } = workspaceTargetConfig;

    const backendInstance = createBackend({
        hostname,
        backend,
        credentials,
    });

    const config: ListCmdActionConfig = {
        ...workspaceTargetConfig,
        backendInstance,
    };

    await doAsyncValidations(config);

    return config;
}
