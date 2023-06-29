// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { logInfo } from "../_base/terminal/loggers.js";
import { genericErrorReporter } from "../_base/utils.js";
import { getInspectCmdActionConfig, InspectCmdActionConfig } from "./actionConfig.js";
import { InspectObjectFn } from "./types.js";

function printInspectConfigSummary(config: InspectCmdActionConfig) {
    const {
        identifier,
        backend,
        hostname,
        workspace,
        credentials: { username },
    } = config;

    logInfo("Everything looks valid. Going to inspect object.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

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
