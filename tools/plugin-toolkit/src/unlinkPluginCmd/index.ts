// (C) 2021 GoodData Corporation
import { ActionOptions, isInputValidationError } from "../_base/types";
import { logError, logInfo, logSuccess, logWarn } from "../_base/terminal/loggers";
import fse from "fs-extra";
import { getUnlinkCmdActionConfig, UnlinkCmdActionConfig } from "./actionConfig";
import {
    isNotAuthenticated,
    IDashboardDefinition,
    IDashboardWithReferences,
} from "@gooddata/sdk-backend-spi";
import { idRef } from "@gooddata/sdk-model";
import ora from "ora";
import { areObjRefsEqual } from "@gooddata/sdk-model";

function printUnlinkConfigSummary(config: UnlinkCmdActionConfig) {
    const {
        backend,
        hostname,
        workspace,
        dashboard,
        identifier,
        credentials: { username },
    } = config;

    logInfo("Everything looks valid. Going to unlink plugin from dashboard.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Dashboard   : ${dashboard}`);
    logInfo(`  Plugin obj  : ${identifier}`);
}

async function removeDashboardPluginLink(config: UnlinkCmdActionConfig): Promise<boolean> {
    const { backendInstance, workspace, dashboard, identifier: validIdentifier } = config;
    const dashboardRef = idRef(dashboard);

    const dashboardWithReferences: IDashboardWithReferences = await backendInstance
        .workspace(workspace)
        .dashboards()
        .getDashboardWithReferences(dashboardRef, undefined, undefined, ["dashboardPlugin"]);
    const {
        dashboard: dashboardObj,
        references: { plugins: pluginObjects },
    } = dashboardWithReferences;
    const pluginToRemove = pluginObjects.find((plugin) => plugin.identifier === validIdentifier);

    if (!pluginToRemove) {
        // the validation done before confirmed that the plugin is there. if the code cannot find the
        // plugin now then there must be a race as the plugin disappeared between validation and actual
        // removal
        logWarn(`Plugin with identifier ${validIdentifier} was not linked with the dashboard ${dashboard}.`);

        return false;
    }

    const plugins = dashboardObj.plugins ? [...dashboardObj.plugins] : [];
    const retainPlugins = plugins.filter((link) => {
        return !areObjRefsEqual(link.plugin, pluginToRemove.ref);
    });

    // note: need the cast here as IDashboard filterContext may contain ITempFilter context in some cases...
    // but that's not going to happen here (because code never asked for export-specific temp filters)
    const updatedDashboard: IDashboardDefinition = {
        ...(dashboardObj as IDashboardDefinition),
        plugins: retainPlugins,
    };

    await backendInstance.workspace(workspace).dashboards().updateDashboard(dashboardObj, updatedDashboard);

    return true;
}

export async function unlinkPluginCmdAction(identifier: string, options: ActionOptions): Promise<void> {
    if (!fse.existsSync("package.json")) {
        logError(
            "Cannot find package.json. Please make sure to run the tool in directory that contains your dashboard plugin project.",
        );

        process.exit(1);
        return;
    }

    try {
        const config: UnlinkCmdActionConfig = await getUnlinkCmdActionConfig(identifier, options);

        printUnlinkConfigSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Dashboard was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
            return;
        }

        const updateProgress = ora({
            text: "Removing link between dashboard and plugin.",
        });

        let result = false;
        try {
            updateProgress.start();

            result = await removeDashboardPluginLink(config);
        } finally {
            updateProgress.stop();
        }

        if (result) {
            logSuccess(`Plugin ${config.identifier} was unlinked from dashboard ${config.dashboard}.`);
        }
    } catch (e) {
        if (isInputValidationError(e)) {
            logError(e.message);
        } else if (isNotAuthenticated(e)) {
            logError(
                "Authentication to backend has failed. Please ensure your environment is setup with correct credentials.",
            );
        } else {
            logError(`An error has occurred while linking plugin to a dashboard: ${e.message}`);
        }

        process.exit(1);
    }
}
