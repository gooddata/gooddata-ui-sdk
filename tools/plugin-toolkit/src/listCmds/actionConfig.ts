// (C) 2021-2025 GoodData Corporation

import ora from "ora";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { createBackend } from "../_base/backend.js";
import { asyncValidOrDie, createWorkspaceValidator } from "../_base/inputHandling/validators.js";
import { type ActionOptions } from "../_base/types.js";
import { type WorkspaceTargetConfig, createWorkspaceTargetConfig } from "../_base/workspaceTargetConfig.js";

export type ListCmdActionConfig = WorkspaceTargetConfig & {
    backendInstance: IAnalyticalBackend;
};

async function doAsyncValidations({ backendInstance, workspace }: ListCmdActionConfig) {
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
