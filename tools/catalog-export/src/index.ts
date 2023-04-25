#!/usr/bin/env node
// (C) 2007-2023 GoodData Corporation
import { program } from "commander";
import chalk from "chalk";
import * as path from "path";
import * as pkg from "../package.json";
import { logBox, logError, logSuccess, printHeader } from "./cli/loggers";
import { clearTerminal } from "./cli/clear";
import { requestFilePath } from "./cli/prompts";
import { getConfigFromConfigFile, getConfigFromEnv, getConfigFromOptions } from "./base/config";
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_HOSTNAME, DEFAULT_OUTPUT_FILE_NAME } from "./base/constants";
import { CatalogExportConfig, isCatalogExportError, WorkspaceMetadata } from "./base/types";
import { exportMetadataToTypescript } from "./exports/metaToTypescript";
import { exportMetadataToJavascript } from "./exports/metaToJavascript";
import { loadWorkspaceMetadataFromBear } from "./loaders/bear";
import { loadWorkspaceMetadataFromTiger } from "./loaders/tiger";
import fs from "fs";

program
    .version(pkg.version)
    .option("--workspace-id <id>", "Workspace id for which you want to export the catalog.")
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option(
        "--output <value>",
        `Output file (defaults to ${DEFAULT_OUTPUT_FILE_NAME}). The output file will be created in current working directory`,
    )
    .option("--hostname <url>", `Instance of GoodData platform. The default is ${DEFAULT_HOSTNAME}`)
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
    printHeader(pkg.version);

    const options = program.opts();
    if (options.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const configFilePath = options.config || DEFAULT_CONFIG_FILE_NAME;
    const mergedConfig = getConfigFromConfigFile(
        configFilePath,
        getConfigFromOptions(options, getConfigFromEnv()),
    );
    const { output, backend } = mergedConfig;

    try {
        const filePath = path.resolve(output || (await requestFilePath()));
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
