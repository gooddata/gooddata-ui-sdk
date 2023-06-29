// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { AddCmdActionConfig, getAddCmdActionConfig } from "./actionConfig.js";
import { IDashboardPlugin } from "@gooddata/sdk-model";
import { genericErrorReporter } from "../_base/utils.js";
import isEmpty from "lodash/isEmpty.js";

function printAddConfigSummary(config: AddCmdActionConfig) {
    const {
        backend,
        hostname,
        workspace,
        pluginUrl,
        credentials: { username },
        pluginName,
        pluginDescription,
    } = config;

    logInfo("Everything looks valid. Going to add new plugin object to workspace metadata.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Plugin URL  : ${pluginUrl}`);
    logInfo(`  Plugin name : ${pluginName}`);

    const description = isEmpty(pluginDescription) ? "(empty)" : pluginDescription;
    logInfo(`  Plugin desc : ${description}   (see package.json)`);
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
    try {
        const config: AddCmdActionConfig = await getAddCmdActionConfig(pluginUrl, options);

        printAddConfigSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Workspace was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
        }

        const newPluginObject = await createPluginObject(config);

        logSuccess(`Created new plugin object with ID: ${newPluginObject.identifier}`);
    } catch (e: any) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
