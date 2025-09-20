// (C) 2022-2025 GoodData Corporation

import { isEqual } from "lodash-es";
import ora from "ora";

import { IDashboard, IDashboardDefinition, areObjRefsEqual, idRef } from "@gooddata/sdk-model";

import { UpdatePluginParamsCmdConfig, getUpdatePluginParamsCmdConfig } from "./actionConfig.js";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { ActionOptions } from "../_base/types.js";
import { genericErrorReporter } from "../_base/utils.js";

function printUsedUpdatePluginParamsSummary(config: UpdatePluginParamsCmdConfig) {
    const { hostname, workspace, dashboard, identifier, parameters } = config;

    logInfo("Everything looks valid. Going to update plugin parameters on the dashboard.");
    logInfo(`  Hostname    : ${hostname}   (${"GoodData.CN"})`);

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Dashboard   : ${dashboard}`);
    logInfo(`  Plugin obj  : ${identifier}`);
    logInfo(`  Parameters  : ${parameters}`);
}

async function updateDashboardWithNewParams(config: UpdatePluginParamsCmdConfig) {
    const { backendInstance, workspace, dashboard, identifier: validIdentifier, parameters } = config;
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
                parameters,
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

export async function updatePluginParamCmdAction(identifier: string, options: ActionOptions): Promise<void> {
    try {
        const config: UpdatePluginParamsCmdConfig = await getUpdatePluginParamsCmdConfig(identifier, options);

        printUsedUpdatePluginParamsSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Dashboard was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
        }

        const updateProgress = ora({
            text: "Updating parameters on the linked plugin.",
        });

        let success = false;
        try {
            updateProgress.start();
            await updateDashboardWithNewParams(config);
            success = true;
        } finally {
            updateProgress.stop();
        }

        if (success) {
            logSuccess(
                `Parameters on linked plugin ${config.identifier} on dashboard ${config.dashboard} has been updated with ${config.parameters}.`,
            );
        }
    } catch (e) {
        genericErrorReporter(e);
        process.exit(1);
    }
}
