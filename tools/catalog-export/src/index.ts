#!/usr/bin/env node
// (C) 2007-2023 GoodData Corporation
import { program } from "commander";
import chalk from "chalk";
import * as path from "path";
import fs from "fs";
import * as dotenv from "dotenv";
import { LIB_VERSION } from "./__version.js";
import { log, logBox, logError, logSuccess, printHeader } from "./cli/loggers.js";
import { clearTerminal } from "./cli/clear.js";
import { promptHostname, requestFilePath } from "./cli/prompts.js";
import {
    getConfigFromConfigFile,
    getConfigFromEnv,
    getConfigFromOptions,
    getConfigFromPackage,
    mergeConfigs,
} from "./base/config.js";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME, DEFAULT_OUTPUT_FILE_NAME } from "./base/constants.js";
import { CatalogExportConfig, isCatalogExportError, WorkspaceMetadata } from "./base/types.js";
import { exportMetadataToTypescript } from "./exports/metaToTypescript.js";
import { exportMetadataToJavascript } from "./exports/metaToJavascript.js";
import { loadWorkspaceMetadataFromBear } from "./loaders/bear/index.js";
import { loadWorkspaceMetadataFromTiger } from "./loaders/tiger/index.js";

dotenv.config();

program
    .version(LIB_VERSION)
    .option("--workspace-id <id>", "Workspace id for which you want to export the catalog.")
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option(
        "--catalog-output <value>",
        `Output file (defaults to ${DEFAULT_OUTPUT_FILE_NAME}). The output file will be created in current working directory`,
    )
    .option("--hostname <url>", `Instance of GoodData platform.`)
    .option("--config <path>", `Custom config file (default ${DEFAULT_CONFIG_FILE_NAME})`)
    .option(
        "--backend <backend>",
        "Indicates type of the backend that runs on the hostname. Can be either tiger for GoodData Cloud or GoodData.CN or bear for the GoodData platform. Default: tiger",
    )
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .parse(process.argv);

async function loadProjectMetadataFromBackend(config: CatalogExportConfig): Promise<WorkspaceMetadata> {
    if (config.backend === "bear") {
        return loadWorkspaceMetadataFromBear(config);
    }

    return loadWorkspaceMetadataFromTiger(config);
}

async function checkFolderExists(filePath: string) {
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory);
    }
}

async function run() {
    clearTerminal();
    printHeader(LIB_VERSION);

    const options = program.opts();
    if (options.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    try {
        const configFilePath = options.config || DEFAULT_CONFIG_FILE_NAME;

        const mergedConfig = mergeConfigs(
            ...(await Promise.all([
                DEFAULT_CONFIG,
                getConfigFromPackage(process.cwd()),
                getConfigFromConfigFile(configFilePath),
                getConfigFromEnv(process.env),
                getConfigFromOptions(options),
            ])),
        );
        const { catalogOutput, backend, hostname } = mergedConfig;

        const filePath = path.resolve(catalogOutput || (await requestFilePath()));

        if (hostname) {
            log("Hostname", hostname);
        } else {
            mergedConfig.hostname = await promptHostname();
        }

        const projectMetadata = await loadProjectMetadataFromBackend(mergedConfig);

        await checkFolderExists(filePath);

        if (filePath.endsWith(".js")) {
            await exportMetadataToJavascript(projectMetadata, filePath, backend !== "bear");
        } else {
            await exportMetadataToTypescript(projectMetadata, filePath, backend !== "bear");
        }

        logSuccess("All data have been successfully exported");
        logBox(
            chalk`The result generated from workspace with id {bold ${projectMetadata.workspaceId}} is located at {bold ${filePath}}`,
        );

        process.exit(0);
    } catch (err: any) {
        if (isCatalogExportError(err)) {
            logError(`${err.message}`);
            process.exit(err.rc);
        } else {
            if (err.code === "ENOENT") {
                logError(`${err.code} Could not create file`);
            } else {
                logError(`${err.name}: ${err.message}`);
            }
            process.exit(1);
        }
    }
}

run();
