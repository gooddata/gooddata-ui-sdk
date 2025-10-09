// (C) 2021-2025 GoodData Corporation

import { isEmpty } from "lodash-es";

import { IDashboardPlugin } from "@gooddata/sdk-model";

import { AddCmdActionConfig, getAddCmdActionConfig } from "./actionConfig.js";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { ActionOptions } from "../_base/types.js";
import { genericErrorReporter } from "../_base/utils.js";

function printAddConfigSummary({
    hostname,
    workspace,
    pluginUrl,
    pluginName,
    pluginDescription,
}: AddCmdActionConfig) {
    logInfo("Everything looks valid. Going to add new plugin object to workspace metadata.");
    logInfo(`  Hostname    : ${hostname}   (${"GoodData.CN"})`);

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Plugin URL  : ${pluginUrl}`);
    logInfo(`  Plugin name : ${pluginName}`);

    const description = isEmpty(pluginDescription) ? "(empty)" : pluginDescription;
    logInfo(`  Plugin desc : ${description}   (see package.json)`);
}

function createPluginObject({
    backendInstance,
    workspace,
    pluginUrl: validUrl,
    pluginName,
    pluginDescription,
}: AddCmdActionConfig): Promise<IDashboardPlugin> {
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
