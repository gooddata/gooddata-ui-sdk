// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import { logInfo } from "../_base/cli/loggers";

export async function addPluginCmdAction(options: ActionOptions): Promise<void> {
    logInfo(`addPluginCmdAction ${JSON.stringify(options, null, 4)}`);
}
