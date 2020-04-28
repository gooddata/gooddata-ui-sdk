#!/usr/bin/env node
// (C) 2007-2019 GoodData Corporation
import program from "commander";
import ora from "ora";
import chalk from "chalk";
import gooddata from "@gooddata/gd-bear-client";
import * as path from "path";
import * as pkg from "../package.json";
import { log, logBox, logError, logSuccess, logWarn, printHeader } from "./cli/loggers";
import { clearLine, clearTerminal } from "./cli/clear";
import { promptPassword, promptProjectId, promptUsername, requestFilePath } from "./cli/prompts";
import { getConfigFromConfigFile, getConfigFromProgram } from "./base/config";
import { DEFAULT_CONFIG_FILE_NAME, DEFAULT_HOSTNAME, DEFAULT_OUTPUT_FILE_NAME } from "./base/constants";
import { isCatalogExportError } from "./base/types";
import { exportMetadataToCatalog } from "./exports/metaToCatalog";
import { exportMetadataToTypescript } from "./exports/metaToTypescript";
import { exportMetadataToJavascript } from "./exports/metaToJavascript";

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
    .option("--accept-untrusted-ssl", "Allows to run the tool with host, that has untrusted ssl certificate")
    .parse(process.argv);

async function run() {
    clearTerminal();
    printHeader(pkg.version);

    if (program.acceptUntrustedSsl) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }

    const configFilePath = program.config || DEFAULT_CONFIG_FILE_NAME;
    const configFileOptions = getConfigFromConfigFile(configFilePath, getConfigFromProgram(program));

    const { projectName, hostname, output } = configFileOptions;
    let { projectId, username, password } = configFileOptions;

    gooddata.config.setCustomDomain(hostname || DEFAULT_HOSTNAME);
    gooddata.config.setJsPackage(pkg.name, pkg.version);

    const logInSpinner = ora();
    try {
        if (username) {
            log("Username", username);
        } else {
            username = await promptUsername();
        }

        password = password || (await promptPassword());

        logInSpinner.start("Logging in...");
        await gooddata.user.login(username, password);
        logInSpinner.stop();
        clearLine();
    } catch (err) {
        logInSpinner.stop();
        clearLine();
        logError("Unable to log in to platform");
        process.exit(1);
        return;
    }

    const projectSpinner = ora();
    try {
        if (projectName && !projectId) {
            log("Project Name", projectName);
            projectSpinner.start("Loading project");
            const metadataResponse = await gooddata.xhr.get("/gdc/md");
            const metadata = metadataResponse.getData();
            projectSpinner.stop();
            const projectMetadata = metadata.about
                ? metadata.about.links.find((link: any) => {
                      return link.title === projectName;
                  })
                : null;
            if (projectMetadata) {
                projectId = projectMetadata.identifier;
            } else {
                logError(`Could not find a project with name '${projectName}'`);
            }
        }
        if (projectId) {
            log("Project ID", projectId);
        } else {
            projectId = await promptProjectId();
        }

        const filePath = path.resolve(output || (await requestFilePath()));

        if (filePath.endsWith(".ts")) {
            await exportMetadataToTypescript(projectId, filePath);
        } else if (filePath.endsWith(".js")) {
            await exportMetadataToJavascript(projectId, filePath);
        } else {
            logWarn(
                "Exporting catalog to JSON document is deprecated and will disappear in next major release together with CatalogHelper. Please switch to generating TypeScript or JavaScript code.",
            );

            await exportMetadataToCatalog(projectId, filePath);
        }

        logSuccess("All data have been successfuly exported");
        logBox(chalk`The result is located at {bold ${filePath}}`);

        process.exit(0);
    } catch (err) {
        if (isCatalogExportError(err)) {
            logError(`${err.message}`);
            process.exit(err.rc);
        } else {
            projectSpinner.stop();
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
