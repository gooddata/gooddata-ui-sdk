// (C) 2022 GoodData Corporation

import { areObjRefsEqual, IDashboard, IDashboardDefinition, idRef } from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import ora from "ora";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { ActionOptions } from "../_base/types.js";
import { genericErrorReporter } from "../_base/utils.js";
import { getRemovePluginParamsCmdConfig, RemovePluginParamsCmdConfig } from "./actionConfig.js";

function printUsedUpdatePluginParamsSummary(config: RemovePluginParamsCmdConfig) {
    const {
        backend,
        hostname,
        workspace,
        dashboard,
        identifier,
        credentials: { username },
    } = config;

    logInfo("Everything looks valid. Going to update plugin parameters on the dashboard.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Dashboard   : ${dashboard}`);
    logInfo(`  Plugin obj  : ${identifier}`);
}

async function updateDashboardWithRemovedParams(config: RemovePluginParamsCmdConfig) {
    const { backendInstance, workspace, dashboard, identifier: validIdentifier } = config;
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
