// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { logError, logInfo } from "../_base/cli/loggers";
import { getAddCmdActionConfig } from "./actionConfig";
import { isInputValidationError } from "../_base/cli/validators";

export async function addPluginCmdAction(pluginUrl: string, options: ActionOptions): Promise<void> {
    try {
        const config = getAddCmdActionConfig(pluginUrl, options);

        logInfo(`addPluginCmdAction ${JSON.stringify(config, null, 4)}`);
    } catch (e) {
        if (isInputValidationError(e)) {
            logError(e.message);

            process.exit(1);
        } else {
            logError(`An error has occurred while adding plugin: ${e.message}`);
        }
    }
}
