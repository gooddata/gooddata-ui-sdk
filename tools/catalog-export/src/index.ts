#!/usr/bin/env node
// (C) 2007-2022 GoodData Corporation
import { program } from "commander";
import chalk from "chalk";
import * as path from "path";
import * as pkg from "../package.json";
import { logBox, logError, logSuccess, logWarn, printHeader } from "./cli/loggers";
import { clearTerminal } from "./cli/clear";
import { requestFilePath } from "./cli/prompts";
import { getConfigFromConfigFile, getConfigFromEnv, getConfigFromOptions } from "./base/config";
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_HOSTNAME, DEFAULT_OUTPUT_FILE_NAME } from "./base/constants";
import { CatalogExportConfig, isCatalogExportError, WorkspaceMetadata } from "./base/types";
import { exportMetadataToCatalog } from "./exports/metaToCatalog";
import { exportMetadataToTypescript } from "./exports/metaToTypescript";
import { exportMetadataToJavascript } from "./exports/metaToJavascript";
import { loadWorkspaceMetadataFromBear } from "./loaders/bear";
import { loadWorkspaceMetadataFromTiger } from "./loaders/tiger";
import fs from "fs";

program
    .version(pkg.version)
    .option(
        "--project-id <id>",
        "Project id for which you want to export the catalog. This option is deprecated in favor of workspace-id. It will disappear in the next major release.",
    )
    .option(
        "--project-name <value>",
        "Project name for which you want to export the catalog. This option is deprecated in favor of workspace-id. It will disappear in the next major release.",
    )
    .option(
        "--workspace-id <id>",
        "Workspace id for which you want to export the catalog. This is a synonym for project-id. If not specified, code will fall back to use project-id.",
    )
    .option(
        "--workspace-name <value>",
        "Workspace name for which you want to export the catalog. This is a synonym for project-name. If not specified, code will fall back to use project-name.",
    )
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option(
        "--output <value>",
        `Output file (defaults to ${DEFAULT_OUTPUT_FILE_NAME}). The output file will be created in current working directory`,
    )
    .option("--hostname <url>", `Instance of GoodData platform. The default is ${DEFAULT_HOSTNAME}`)
    .option("--config <path>", `Custom config file (default ${DEFAULT_CONFIG_FILE_NAME})`)
    .option(
        "--backend <backend>",
        "Indicates type of the backend that runs on the hostname. Can be either bear for the GoodData platform or tiger for GoodData Cloud or GoodData.CN. Default: bear",
    )
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .option("--demo", "Allows to export catalog with demo data without authentication.")
    .parse(process.argv);

async function loadProjectMetadataFromBackend(config: CatalogExportConfig): Promise<WorkspaceMetadata> {
    if (config.backend === "tiger") {
        return loadWorkspaceMetadataFromTiger(config);
    }

    return loadWorkspaceMetadataFromBear(config);
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

        if (filePath.endsWith(".ts")) {
            await exportMetadataToTypescript(projectMetadata, filePath, backend === "tiger");
        } else if (filePath.endsWith(".js")) {
            await exportMetadataToJavascript(projectMetadata, filePath, backend === "tiger");
        } else {
            logWarn(
                "Exporting catalog to JSON document is deprecated and will disappear in next major release together with CatalogHelper. Please switch to generating TypeScript or JavaScript code.",
            );

            await exportMetadataToCatalog(projectMetadata, filePath);
        }

        logSuccess("All data have been successfully exported");
        logBox(
            chalk`The result generated from workspace with id {bold ${projectMetadata.workspaceId}} is located at {bold ${filePath}}`,
        );

        process.exit(0);
    } catch (err) {
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
