// (C) 2021-2022 GoodData Corporation
import { ActionOptions } from "../_base/types.js";
import { logInfo, logSuccess } from "../_base/terminal/loggers.js";
import { genericErrorReporter } from "../_base/utils.js";
import { getListCmdActionConfig, ListCmdActionConfig } from "./actionConfig.js";
import { ListObjectsFn } from "./types.js";
import columnify from "columnify";

function printListConfigSummary(config: ListCmdActionConfig) {
    const {
        backend,
        hostname,
        workspace,
        credentials: { username },
    } = config;

    logInfo("Everything looks valid. Going to list objects.");
    logInfo(`  Hostname    : ${hostname}   (${backend === "bear" ? "GoodData platform" : "GoodData.CN"})`);

    if (backend === "bear") {
        logInfo(`  Username    : ${username}`);
    }

    logInfo(`  Workspace   : ${workspace}`);
}

export async function listCmdAction(listObjFn: ListObjectsFn, options: ActionOptions): Promise<void> {
    try {
        const config: ListCmdActionConfig = await getListCmdActionConfig(options);

        printListConfigSummary(config);

        const listEntries = await listObjFn(config, options);

        // eslint-disable-next-line no-console
        console.log(
            columnify(listEntries, {
                config: {
                    title: {
                        maxWidth: 25,
                    },
                    description: {
                        maxWidth: 30,
                    },
                },
            }),
        );

        logSuccess(`Listed ${listEntries.length} object(s).`);
    } catch (e) {
        genericErrorReporter(e);

        process.exit(1);
    }
}
