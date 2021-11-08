// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { logError, logInfo, logWarn } from "../_base/cli/loggers";
import { AddCmdActionConfig, getAddCmdActionConfig } from "./actionConfig";
import { isInputValidationError } from "../_base/cli/validators";
import fse from "fs-extra";
import { isNotAuthenticated } from "@gooddata/sdk-backend-spi";

function printAddConfigSummary(config: AddCmdActionConfig) {
    const { backend, hostname, workspace, pluginUrl, username } = config;

    logInfo("Everything looks valid. Going to add new plugin object to workspace metadata.");
    logInfo(`  Hostname  : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username  : ${username}`);
    }

    logInfo(`  Workspace : ${workspace}`);
    logInfo(`  Plugin URL: ${pluginUrl}`);
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
        }
    } catch (e) {
        if (isInputValidationError(e)) {
            logError(e.message);
        } else if (isNotAuthenticated(e)) {
            logError(
                "Authentication to backend has failed. Please ensure your environment is setup with correct credentials.",
            );
        } else {
            logError(`An error has occurred while adding plugin: ${e.message}`);
        }

        process.exit(1);
    }
}
