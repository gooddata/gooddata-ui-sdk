// (C) 2021-2025 GoodData Corporation

import columnify from "columnify";

import { ListCmdActionConfig, getListCmdActionConfig } from "./actionConfig.js";
import { ListObjectsFn } from "./types.js";
import { logInfo, logSuccess } from "../_base/terminal/loggers.js";
import { ActionOptions } from "../_base/types.js";
import { genericErrorReporter } from "../_base/utils.js";

function printListConfigSummary({ hostname, workspace }: ListCmdActionConfig) {
    logInfo("Everything looks valid. Going to list objects.");
    logInfo(`  Hostname    : ${hostname}   (${"GoodData.CN"}`);

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
