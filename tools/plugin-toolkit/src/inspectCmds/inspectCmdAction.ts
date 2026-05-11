// (C) 2021-2026 GoodData Corporation

import { logInfo } from "../_base/terminal/loggers.js";
import { type ActionOptions } from "../_base/types.js";
import { genericErrorReporter } from "../_base/utils.js";

import { type InspectCmdActionConfig, getInspectCmdActionConfig } from "./actionConfig.js";
import { type InspectObjectFn } from "./types.js";

function printInspectConfigSummary({ identifier, hostname, workspace }: InspectCmdActionConfig) {
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
