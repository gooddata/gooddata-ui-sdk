// (C) 2021 GoodData Corporation
import { ActionOptions, isInputValidationError } from "../_base/types";
import { logError, logInfo, logWarn } from "../_base/terminal/loggers";
import fse from "fs-extra";
import { getUseCmdActionConfig, UseCmdActionConfig } from "./actionConfig";
import { isNotAuthenticated } from "@gooddata/sdk-backend-spi";

function printUseConfigSummary(config: UseCmdActionConfig) {
    const {
        backend,
        hostname,
        workspace,
        dashboard,
        identifier,
        credentials: { username },
    } = config;

    logInfo("Everything looks valid. Going to use plugin object to dashboard metadata.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Dashboard   : ${dashboard}`);
    logInfo(`  Plugin obj  : ${identifier}`);
}

export async function usePluginCmdAction(identifier: string, options: ActionOptions): Promise<void> {
    if (!fse.existsSync("package.json")) {
        logError(
            "Cannot find package.json. Please make sure to run the tool in directory that contains your dashboard plugin project.",
        );

        process.exit(1);
        return;
    }

    try {
        const config: UseCmdActionConfig = await getUseCmdActionConfig(identifier, options);

        printUseConfigSummary(config);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Dashboard was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
            return;
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
