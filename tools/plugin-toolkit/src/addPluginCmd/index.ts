// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { logError, logInfo, logWarn } from "../_base/cli/loggers";
import { AddCmdActionConfig, getAddCmdActionConfig } from "./actionConfig";
import { isInputValidationError } from "../_base/cli/validators";
import fse from "fs-extra";

export async function addPluginCmdAction(pluginUrl: string, options: ActionOptions): Promise<void> {
    if (!fse.existsSync("package.json")) {
        logError(
            "Cannot find package.json. Please make sure to run the tool in directory that contains your dashboard plugin project.",
        );

        process.exit(1);
        return;
    }

    try {
        const config: AddCmdActionConfig = getAddCmdActionConfig(pluginUrl, options);
        logInfo(`addPluginCmdAction ${JSON.stringify(config, null, 4)}`);

        if (config.dryRun) {
            logWarn(
                "Dry run has finished. Workspace was not updated. Remove '--dry-run' to perform the actual update.",
            );

            process.exit(0);
        }
    } catch (e) {
        if (isInputValidationError(e)) {
            logError(e.message);

            process.exit(1);
        } else {
            logError(`An error has occurred while adding plugin: ${e.message}`);
        }
    }
}
