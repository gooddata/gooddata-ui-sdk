#!/usr/bin/env node
// (C) 2007-2025 GoodData Corporation
import fs from "fs";
import * as path from "path";

import chalk from "chalk";
import { program } from "commander";
import * as dotenv from "dotenv";

import { LIB_VERSION } from "./__version.js";
import {
    getConfigFromConfigFile,
    getConfigFromEnv,
    getConfigFromOptions,
    getConfigFromPackage,
    mergeConfigs,
} from "./base/config.js";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_FILE_NAME, DEFAULT_OUTPUT_FILE_NAME } from "./base/constants.js";
import { CatalogExportConfig, WorkspaceMetadata, isCatalogExportError } from "./base/types.js";
import { clearTerminal } from "./cli/clear.js";
import { log, logBox, logError, logSuccess, printHeader } from "./cli/loggers.js";
import { promptHostname, requestFilePath } from "./cli/prompts.js";
import { exportMetadataToJavascript } from "./exports/metaToJavascript.js";
import { exportMetadataToTypescript } from "./exports/metaToTypescript.js";
import { loadWorkspaceMetadataFromTiger } from "./loaders/tiger/index.js";

dotenv.config();

program
    .version(LIB_VERSION)
    .option("--workspace-id <id>", "Workspace id for which you want to export the catalog.")
    .option(
        "--catalog-output <value>",
        `Output file (defaults to ${DEFAULT_OUTPUT_FILE_NAME}). The output file will be created in current working directory`,
    )
    .option("--hostname <url>", `Instance of GoodData backend`)
    .option("--config <path>", `Custom config file (default ${DEFAULT_CONFIG_FILE_NAME})`)
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .option(
        "--backend",
        "Deprecated: Retained for backward compatibility. Previously allowed selection of backends, now defaults to 'tiger' with no alternative options. Unnecessary for new scripts.",
    )
    .parse(process.argv);

async function loadProjectMetadataFromBackend(config: CatalogExportConfig): Promise<WorkspaceMetadata> {
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
        const { catalogOutput, hostname } = mergedConfig;

        const filePath = path.resolve(catalogOutput || (await requestFilePath()));

        if (hostname) {
            log("Hostname", hostname);
        } else {
            mergedConfig.hostname = await promptHostname();
        }

        const projectMetadata = await loadProjectMetadataFromBackend(mergedConfig);

        await checkFolderExists(filePath);

        if (filePath.endsWith(".js")) {
            await exportMetadataToJavascript(projectMetadata, filePath);
        } else {
            await exportMetadataToTypescript(projectMetadata, filePath);
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
