// (C) 2022-2025 GoodData Corporation

import { isEqual } from "lodash-es";
import ora from "ora";

import { type IDashboard, type IDashboardDefinition, areObjRefsEqual, idRef } from "@gooddata/sdk-model";

import { type RemovePluginParamsCmdConfig, getRemovePluginParamsCmdConfig } from "./actionConfig.js";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { type ActionOptions } from "../_base/types.js";
import { genericErrorReporter } from "../_base/utils.js";

function printUsedUpdatePluginParamsSummary({
    hostname,
    workspace,
    dashboard,
    identifier,
}: RemovePluginParamsCmdConfig) {
    logInfo("Everything looks valid. Going to update plugin parameters on the dashboard.");
    logInfo(`  Hostname    : ${hostname}   (${"GoodData.CN"})`);

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Dashboard   : ${dashboard}`);
    logInfo(`  Plugin obj  : ${identifier}`);
}

async function updateDashboardWithRemovedParams({
    backendInstance,
    workspace,
    dashboard,
    identifier: validIdentifier,
}: RemovePluginParamsCmdConfig) {
    const dashboardRef = idRef(dashboard);

    const dashboardObj: IDashboard = await backendInstance
        .workspace(workspace)
        .dashboards()
        .getDashboard(dashboardRef);

    const dashboardReferencedObjects = await backendInstance
        .workspace(workspace)
        .dashboards()
        .getDashboardReferencedObjects(dashboardObj, ["dashboardPlugin"]);

    const touchedPlugin = dashboardReferencedObjects.plugins.find((plugin) =>
        isEqual(plugin.identifier, validIdentifier),
    );

    const plugins = dashboardObj.plugins?.map((plugin) => {
        if (areObjRefsEqual(plugin.plugin, touchedPlugin?.ref)) {
            return {
                ...plugin,
                parameters: undefined,
            };
        }
        return plugin;
    });

    // note: need the cast here as IDashboard filterContext may contain ITempFilter context in some cases...
    // but that's not going to happen here (because code never asked for export-specific temp filters)
    const updatedDashboard: IDashboardDefinition = {
        ...(dashboardObj as IDashboardDefinition),
        plugins,
    };

    await backendInstance.workspace(workspace).dashboards().updateDashboard(dashboardObj, updatedDashboard);
}

export async function removePluginParamCmdAction(identifier: string, options: ActionOptions): Promise<void> {
    try {
        const config: RemovePluginParamsCmdConfig = await getRemovePluginParamsCmdConfig(identifier, options);

        printUsedUpdatePluginParamsSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Dashboard was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
        }

        const updateProgress = ora({
            text: "Removing the parameters from the linked plugin.",
        });

        let success = false;
        try {
            updateProgress.start();
            await updateDashboardWithRemovedParams(config);
            success = true;
        } finally {
            updateProgress.stop();
        }

        if (success) {
            logSuccess(
                `Parameters on linked plugin ${config.identifier} on dashboard ${config.dashboard} has been removed.`,
            );
        }
    } catch (e) {
        genericErrorReporter(e);
        process.exit(1);
    }
}
