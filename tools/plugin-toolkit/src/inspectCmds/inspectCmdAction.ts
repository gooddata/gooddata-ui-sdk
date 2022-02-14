// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types";
import fse from "fs-extra";
import { logError, logInfo } from "../_base/terminal/loggers";
import { genericErrorReporter } from "../_base/utils";
import { getInspectCmdActionConfig, InspectCmdActionConfig } from "./actionConfig";
import { InspectObjectFn } from "./types";

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
    if (!fse.existsSync("package.json")) {
        logError(
            "Cannot find package.json. Please make sure to run the tool in directory that contains your dashboard plugin project.",
        );

        process.exit(1);
    }

    try {
        const config: InspectCmdActionConfig = await getInspectCmdActionConfig(identifier, options);

        printInspectConfigSummary(config);

        await inspectObjFn(config, options);
    } catch (e) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
