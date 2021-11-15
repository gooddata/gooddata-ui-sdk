// (C) 2021 GoodData Corporation
import { ActionOptions } from "../_base/types";
import fse from "fs-extra";
import { logError, logInfo, logSuccess } from "../_base/terminal/loggers";
import { genericErrorReporter } from "../_base/utils";
import { getListCmdActionConfig, ListCmdActionConfig } from "./actionConfig";
import { ListObjectsFn } from "./types";
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
    if (!fse.existsSync("package.json")) {
        logError(
            "Cannot find package.json. Please make sure to run the tool in directory that contains your dashboard plugin project.",
        );

        process.exit(1);
        return;
    }

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
