// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { logInfo } from "../_base/cli/loggers";

export async function initCmdAction(pluginName: string, options: ActionOptions): Promise<void> {
    logInfo(`initCmdAction ${pluginName} ${JSON.stringify(options, null, 4)}`);
}
