// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { logError, logInfo, logSuccess, logWarn } from "../_base/terminal/loggers";
import { AddCmdActionConfig, getAddCmdActionConfig } from "./actionConfig";
import fse from "fs-extra";
import { IDashboardPlugin } from "@gooddata/sdk-backend-spi";
import { genericErrorReporter } from "../_base/utils";

function printAddConfigSummary(config: AddCmdActionConfig) {
    const {
        backend,
        hostname,
        workspace,
        pluginUrl,
        credentials: { username },
        pluginName,
    } = config;

    logInfo("Everything looks valid. Going to add new plugin object to workspace metadata.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Plugin URL  : ${pluginUrl}`);
    logInfo(`  Plugin name : ${pluginName}`);
}

function createPluginObject(config: AddCmdActionConfig): Promise<IDashboardPlugin> {
    const { backendInstance, workspace, pluginUrl: validUrl, pluginName, pluginDescription } = config;

    return backendInstance.workspace(workspace).dashboards().createDashboardPlugin({
        type: "IDashboardPlugin",
        url: validUrl,
        name: pluginName,
        description: pluginDescription,
        tags: [],
    });
}

export async function addPluginCmdAction(pluginUrl: string, options: ActionOptions): Promise<void> {
    if (!fse.existsSync("package.json")) {
        logError(
            "Cannot find package.json. Please make sure to run the tool in directory that contains your dashboard plugin project.",
        );

        process.exit(1);
        return;
    }

    try {
        const config: AddCmdActionConfig = await getAddCmdActionConfig(pluginUrl, options);

        printAddConfigSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Workspace was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
            return;
        }

        const newPluginObject = await createPluginObject(config);

        logSuccess(`Created new plugin object with ID: ${newPluginObject.identifier}`);
    } catch (e: any) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
