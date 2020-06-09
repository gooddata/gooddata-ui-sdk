// (C) 2020 GoodData Corporation
#!/usr/bin/env node
// (C) 2007-2020 GoodData Corporation
import program from "commander";
import chalk from "chalk";
import * as path from "path";
import * as pkg from "../package.json";
import { logBox, logError, logSuccess, logWarn, printHeader } from "./cli/loggers";
import { clearTerminal } from "./cli/clear";
import { requestFilePath } from "./cli/prompts";
import { getConfigFromConfigFile, getConfigFromProgram } from "./base/config";
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_HOSTNAME, DEFAULT_OUTPUT_FILE_NAME } from "./base/constants";
import { CatalogExportConfig, isCatalogExportError, ProjectMetadata } from "./base/types";
import { exportMetadataToCatalog } from "./exports/metaToCatalog";
import { exportMetadataToTypescript } from "./exports/metaToTypescript";
import { exportMetadataToJavascript } from "./exports/metaToJavascript";
import { loadProjectMetadataFromBear } from "./loaders/bear";
import { loadProjectMetadataFromTiger } from "./loaders/tiger";

program
    .version(pkg.version)
    .option("--project-id <id>", "Project id for which you want to export the catalog.")
    .option("--project-name <value>", "Project name for which you want to export the catalog.")
    .option("--username <email>", "Your username that you use to log in to GoodData platform.")
    .option(
        "--output <value>",
        `Output file (defaults to ${DEFAULT_OUTPUT_FILE_NAME}). The output file will be created in current working directory`,
    )
    .option("--hostname <url>", `Instance of GoodData platform. The default is ${DEFAULT_HOSTNAME}`)
    .option("--config <path>", `Custom config file (default ${DEFAULT_CONFIG_FILE_NAME})`)
    .option("--tiger", "Indicates that the tool runs against the GoodData tiger backend")
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .parse(process.argv);

async function loadProjectMetadataFromBackend(config: CatalogExportConfig): Promise<ProjectMetadata> {
    if (config.tiger) {
        return loadProjectMetadataFromTiger(config);
    }

    return loadProjectMetadataFromBear(config);
}

async function run() {
    clearTerminal();
    printHeader(pkg.version);

    if (program.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const configFilePath = program.config || DEFAULT_CONFIG_FILE_NAME;
    const mergedConfig = getConfigFromConfigFile(configFilePath, getConfigFromProgram(program));
    const { output } = mergedConfig;

    try {
        const filePath = path.resolve(output || (await requestFilePath()));
        const projectMetadata = await loadProjectMetadataFromBackend(mergedConfig);

        if (filePath.endsWith(".ts")) {
            await exportMetadataToTypescript(projectMetadata, filePath);
        } else if (filePath.endsWith(".js")) {
            await exportMetadataToJavascript(projectMetadata, filePath);
        } else {
            logWarn(
                "Exporting catalog to JSON document is deprecated and will disappear in next major release together with CatalogHelper. Please switch to generating TypeScript or JavaScript code.",
            );

            await exportMetadataToCatalog(projectMetadata, filePath);
        }

        logSuccess("All data have been successfuly exported");
        logBox(chalk`The result is located at {bold ${filePath}}`);

        process.exit(0);
    } catch (err) {
        if (isCatalogExportError(err)) {
            logError(`${err.message}`);
            process.exit(err.rc);
        } else {
            if (err.code && err.code === "ENOENT") {
                logError(`${err.code} Could not create file`);
            } else {
                logError(`${err.name}: ${err.message}`);
            }
            process.exit(1);
        }
    }
}

run();
