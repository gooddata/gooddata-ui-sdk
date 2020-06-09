// (C) 2007-2020 GoodData Corporation

import { CatalogExportConfig, CatalogExportError, ProjectMetadata } from "../../base/types";
import ora from "ora";
import { log, logError } from "../../cli/loggers";
import { promptPassword, promptUsername } from "../../cli/prompts";
import { clearLine } from "../../cli/clear";
import { ITigerClient } from "@gooddata/gd-tiger-client";
import { tigerLoad } from "./tigerLoad";
import { createTigerClient } from "./tigerClient";

/**
 * Given the export config, ask for any missing information and then load project metadata from
 * a tiger project.
 *
 * @param config - tool configuration, may be missing username, password and project id - in that case code
 *  will prompt
 *
 * @returns loaded project metadata
 *
 * @throws CatalogExportError upon any error.
 */
export async function loadProjectMetadataFromTiger(config: CatalogExportConfig): Promise<ProjectMetadata> {
    const { projectId, hostname } = config;
    let { username, password } = config;

    if (!projectId) {
        throw new CatalogExportError(
            "Please specify workspace identifier in either .gdcatalogrc or via the --project-id argument.",
            1,
        );
    }

    const logInSpinner = ora();
    let tigerClient: ITigerClient | undefined;
    try {
        if (username) {
            log("Username", username);
        } else {
            username = await promptUsername();
        }

        password = password || (await promptPassword());

        logInSpinner.start("Logging in...");

        tigerClient = createTigerClient(hostname!, username, password);

        /*
         * Tiger uses basic auth. Probe that credentials are correct using a GET.
         */
        await tigerClient.metadata.tagsGet({ contentType: "application/json" });

        logInSpinner.stop();
        clearLine();
    } catch (err) {
        logInSpinner.fail();
        clearLine();

        if (err.message && err.message.search(/.*(certificate|self-signed).*/) > -1) {
            logError(
                "Server does not have valid certificate. The login has failed. " +
                    "If you trust the server, you can use the --accept-untrusted-ssl option " +
                    "to turn off certificate validation.",
            );
        }

        throw new CatalogExportError(`Unable to log in to platform. The error was: ${err}`, 1);
    }

    const projectSpinner = ora();
    try {
        return tigerLoad(projectId, tigerClient);
    } catch (err) {
        projectSpinner.stop();

        throw new CatalogExportError(
            `Unable to obtain project metadata from platform. The error was: ${err}`,
            1,
        );
    }
}
