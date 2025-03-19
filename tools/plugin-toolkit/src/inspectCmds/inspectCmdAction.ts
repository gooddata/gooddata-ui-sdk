// (C) 2021-2024 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { logInfo } from "../_base/terminal/loggers.js";
import { genericErrorReporter } from "../_base/utils.js";
import { getInspectCmdActionConfig, InspectCmdActionConfig } from "./actionConfig.js";
import { InspectObjectFn } from "./types.js";

function printInspectConfigSummary(config: InspectCmdActionConfig) {
    const { identifier, hostname, workspace } = config;

    logInfo("Everything looks valid. Going to inspect object.");
    logInfo(`  Hostname    : ${hostname}   (${"GoodData.CN"})`);

    logInfo(`  Workspace   : ${workspace}`);
    logInfo(`  Identifier  : ${identifier}`);
}

export async function inspectCmdAction(
    identifier: string,
    inspectObjFn: InspectObjectFn,
    options: ActionOptions,
): Promise<void> {
    try {
        const config: InspectCmdActionConfig = await getInspectCmdActionConfig(identifier, options);

        printInspectConfigSummary(config);

        await inspectObjFn(config, options);
    } catch (e) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
