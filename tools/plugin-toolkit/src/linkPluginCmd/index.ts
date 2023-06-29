// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { logInfo, logSuccess, logWarn } from "../_base/terminal/loggers.js";
import { getLinkCmdActionConfig, LinkCmdActionConfig } from "./actionConfig.js";
import { idRef, IDashboard, IDashboardDefinition } from "@gooddata/sdk-model";
import ora from "ora";
import { genericErrorReporter } from "../_base/utils.js";

function printUseConfigSummary(config: LinkCmdActionConfig) {
    const {
        backend,
        hostname,
        workspace,
        dashboard,
        identifier,
        parameters,
        withParameters,
        credentials: { username },
    } = config;

    logInfo("Everything looks valid. Going to link plugin on the dashboard.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Dashboard   : ${dashboard}`);
    logInfo(`  Plugin obj  : ${identifier}`);

    if (withParameters) {
        logInfo(`  Parameters  : ${parameters}`);
    }
}

async function updateDashboardWithPluginLink(config: LinkCmdActionConfig) {
    const { backendInstance, workspace, dashboard, identifier: validIdentifier, parameters } = config;
    const dashboardRef = idRef(dashboard);

    const dashboardObj: IDashboard = await backendInstance
        .workspace(workspace)
        .dashboards()
        .getDashboard(dashboardRef);
    const plugins = dashboardObj.plugins ? [...dashboardObj.plugins] : [];

    plugins.push({
        type: "IDashboardPluginLink",
        plugin: idRef(validIdentifier, "dashboardPlugin"),
        parameters,
    });

    // note: need the cast here as IDashboard filterContext may contain ITempFilter context in some cases...
    // but that's not going to happen here (because code never asked for export-specific temp filters)
    const updatedDashboard: IDashboardDefinition = {
        ...(dashboardObj as IDashboardDefinition),
        plugins,
    };

    await backendInstance.workspace(workspace).dashboards().updateDashboard(dashboardObj, updatedDashboard);
}

export async function linkPluginCmdAction(identifier: string, options: ActionOptions): Promise<void> {
    try {
        const config: LinkCmdActionConfig = await getLinkCmdActionConfig(identifier, options);

        printUseConfigSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Dashboard was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
        }

        const updateProgress = ora({
            text: "Linking dashboard with a plugin.",
        });

        let success = false;
        try {
            updateProgress.start();
            await updateDashboardWithPluginLink(config);
            success = true;
        } finally {
            updateProgress.stop();
        }

        if (success) {
            logSuccess(`Linked dashboard ${config.dashboard} with plugin ${config.identifier}.`);
        }
    } catch (e) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
