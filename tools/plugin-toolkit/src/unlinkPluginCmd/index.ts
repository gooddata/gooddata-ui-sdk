// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { getUnlinkCmdActionConfig, UnlinkCmdActionConfig } from "./actionConfig.js";
import { IDashboardWithReferences } from "@gooddata/sdk-backend-spi";
import { areObjRefsEqual, idRef, IDashboardDefinition } from "@gooddata/sdk-model";
import ora from "ora";
import { genericErrorReporter } from "../_base/utils.js";

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
    try {
        const config: UnlinkCmdActionConfig = await getUnlinkCmdActionConfig(identifier, options);

        printUnlinkConfigSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Dashboard was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
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
        genericErrorReporter(e);

        process.exit(1);
    }
}
