#!/usr/bin/env node
// (C) 2007-2023 GoodData Corporation

import { program } from "commander";
import ora from "ora";
import chalk from "chalk";
import pkg from "../package.json";
import * as process from "process";
import * as path from "path";
import pmap from "p-map";
import { log, logError, logInfo, logSuccess } from "./cli/loggers.js";
import { clearLine, clearTerminal } from "./cli/clear.js";
import { promptPassword, promptProjectId, promptUsername } from "./cli/prompts.js";
import { getConfigFromConfigFile, getConfigFromOptions } from "./base/config.js";
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_HOSTNAME, DEFAULT_BACKEND } from "./base/constants.js";
import { DataRecorderConfig, DataRecorderError, isDataRecorderError } from "./base/types.js";
import { generateAllFiles } from "./codegen/index.js";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IRecording } from "./recordings/common.js";
import { discoverExecutionRecordings } from "./recordings/executionRepository.js";
import { discoverDisplayFormRecordings } from "./recordings/displayFormsRepository.js";
import { discoverInsightRecordings } from "./recordings/insightsRepository.js";
import { discoverCatalogRecordings } from "./recordings/catalogRepository.js";
import { discoverVisClassesRecordings } from "./recordings/visClassesRepository.js";
import { getOrInitBackend } from "./backend.js";
import { discoverDashboardRecordings } from "./recordings/dashboardsRepository.js";

program
    .version(pkg.version)
    .option("--recordingDir <path>", "Directory with recording inputs and outputs")
    .option("--project-id <id>", "Project id from which you want to capture mock data")
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option("--hostname <url>", `Instance of GoodData platform. The default is ${DEFAULT_HOSTNAME}`)
    .option("--config <path>", `Custom config file (default ${DEFAULT_CONFIG_FILE_NAME})`)
    .option("--backend <type>", `Backend (default ${DEFAULT_BACKEND})`)
    .option(
        "--replace-project-id <id>",
        `Replace projectId with this value when writing out recordings. By default not specified and projectId will stay in recordings as-is.`,
    )
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .parse(process.argv);

async function promptForMissingConfig(config: DataRecorderConfig): Promise<DataRecorderConfig> {
    const { hostname, backend } = config;
    let { projectId, username, password } = config;

    const logInSpinner = ora();
    try {
        if (username) {
            log("Username", username);
        } else {
            username = await promptUsername();
        }

        password = password || (await promptPassword());

        logInSpinner.start("Logging in...");
        await getOrInitBackend(
            username,
            password,
            hostname || DEFAULT_HOSTNAME,
            backend || DEFAULT_BACKEND,
        ).authenticate();
        logInSpinner.succeed();
        clearLine();
    } catch (err) {
        logInSpinner.fail();
        clearLine();
        logError(`Unable to log in to platform. The error was: ${err}`);

        if ((err as Error).message?.search(/.*(certificate|self-signed).*/) > -1) {
            logError(
                "It seems that this error is due to invalid certificates used on the server. " +
                    "If you trust the server, you can use the --accept-untrusted-ssl option " +
                    "to turn off certificate validation.",
            );
        }

        throw new DataRecorderError("Authentication failed", 1);
    }

    if (projectId) {
        log("Project ID", projectId);
    } else {
        projectId = await promptProjectId();
    }

    return {
        ...config,
        projectId,
        username,
        password,
    };
}

async function captureRecordings(
    recordings: IRecording[],
    backend: IAnalyticalBackend,
    config: DataRecorderConfig,
): Promise<IRecording[]> {
    const executionSpinner = ora();
    let successes = 0;
    executionSpinner.start("Running and capturing executions");

    const onCaptured = (_: IRecording, err?: string): void => {
        if (err) {
            executionSpinner.info(`${chalk.red(err)}`);
            return;
        }

        successes++;
        executionSpinner.info(`Processed ${successes}/${recordings.length} execution(s)`);
    };

    const results = await pmap(
        recordings,
        (rec) => {
            return rec
                .makeRecording(backend, config.projectId!, config.replaceProjectId ?? undefined)
                .then((_) => {
                    onCaptured(rec);

                    return rec;
                })
                .catch((err) => {
                    onCaptured(
                        rec,
                        `An error '${err}' has occurred while obtaining data for recording in ${rec.directory}; it is highly likely that the recording definition is semantically incorrect.`,
                    );

                    return rec;
                });
        },
        { concurrency: 4 },
    );

    if (successes < recordings.length) {
        executionSpinner.warn("Not all recordings were successfully captured. See previous messages.");
    } else {
        executionSpinner.succeed("All recordings were successfully captured.");
    }

    return results;
}

async function run() {
    clearTerminal();
    logInfo(`GoodData Mock Handling Tool v${pkg.version}`);

    const options = program.opts();
    if (options.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const configFilePath = options.config || DEFAULT_CONFIG_FILE_NAME;

    logInfo(`Reading config from ${configFilePath}`);

    const partialConfig = getConfigFromConfigFile(configFilePath, getConfigFromOptions(options));
    const { recordingDir } = partialConfig;

    if (!recordingDir) {
        logError("Please specify directory that should contain the recordings.");

        process.exit(1);
        return;
    }

    const absoluteRecordingDir = path.resolve(recordingDir);
    const recordings = [
        ...(await discoverExecutionRecordings(absoluteRecordingDir)),
        ...(await discoverDisplayFormRecordings(absoluteRecordingDir)),
        ...(await discoverInsightRecordings(absoluteRecordingDir)),
        ...(await discoverCatalogRecordings(absoluteRecordingDir)),
        ...(await discoverVisClassesRecordings(absoluteRecordingDir)),
        ...(await discoverDashboardRecordings(absoluteRecordingDir)),
    ];

    const incompleteRecordings = recordings.filter((e) => !e.isComplete() || e.alwaysRefresh());

    logInfo(
        `Discovered ${recordings.length} recordings; out of these ${incompleteRecordings.length} are missing recorded data.`,
    );

    let recordingsToIndex = recordings.filter((e) => e.isComplete());

    if (incompleteRecordings.length) {
        /*
         * So there is stuff to do; first make sure tool has complete config, prompt user for anything that was
         * not on file or as CLI tool args.
         */
        const fullConfig = await promptForMissingConfig(partialConfig);

        /*
         * Instantiate analytical backend to run requests against; it is enough to do this once for the whole
         * run.
         */
        const backend = getOrInitBackend(
            fullConfig.username!,
            fullConfig.password!,
            options.hostname || DEFAULT_HOSTNAME,
            options.backend || DEFAULT_BACKEND,
        );

        const newRecordings = await captureRecordings(incompleteRecordings, backend, fullConfig);

        recordingsToIndex = recordingsToIndex.concat(newRecordings.filter((e) => e.isComplete()));
    }

    logInfo(`Building recording index for all executions with captured data in ${absoluteRecordingDir}`);

    generateAllFiles(recordingsToIndex, absoluteRecordingDir);

    logSuccess("Done");

    process.exit(0);
}

run().catch((err) => {
    if (isDataRecorderError(err)) {
        process.exit(err.rc);
    } else {
        logError(`An unexpected error has occurred: ${err}`);
        console.error(err);

        process.exit(1);
    }
});

//
// Type exports
//

export {
    DataViewRequests,
    RequestedWindow,
    RecordingFiles,
    ScenarioDescriptor,
    InsightRecordingSpec,
    requestPages,
} from "./interface.js";
