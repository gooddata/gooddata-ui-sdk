// (C) 2007-2021 GoodData Corporation

import { CatalogExportConfig, CatalogExportError, ProjectMetadata } from "../../base/types";
import ora from "ora";
import { log, logError } from "../../cli/loggers";
import { promptPassword, promptUsername } from "../../cli/prompts";
import { clearLine } from "../../cli/clear";
import { ITigerClient } from "@gooddata/api-client-tiger";
import { tigerLoad } from "./tigerLoad";
import { createTigerClient } from "./tigerClient";

/**
 * Tests if the provided tiger client can access the backend.
 * @param tigerClient - tiger client to test
 */
async function probeAccess(tigerClient: ITigerClient, projectId: string): Promise<boolean> {
    try {
        await tigerClient.workspaceModel.getEntitiesMetrics(
            {
                workspaceId: projectId,
            },
            {
                headers: { Accept: "application/vnd.gooddata.api+json" },
            },
        );
        return true;
    } catch (err) {
        if (err?.response?.status === 401) {
            return false;
        }

        if (err.message && err.message.search(/.*(certificate|self-signed).*/) > -1) {
            logError(
                "Server does not have valid certificate. The login has failed. " +
                    "If you trust the server, you can use the --accept-untrusted-ssl option " +
                    "to turn off certificate validation.",
            );

            throw err;
        }

        logError("There was an unexpected error while communicating with the server: \n" + err.message);
        throw err;
    }
}

/**
 * Gets the tiger client asking for credentials if they are needed.
 * @param hostname - hostname to use
 * @param usernameFromConfig - username that may have been provided in a config or CLI
 * @param passwordFromConfig - password that may have been provided in a config or CLI
 */
async function getTigerClient(
    hostname: string,
    usernameFromConfig: string | null,
    passwordFromConfig: string | null,
    projectIdFromConfig: string,
): Promise<ITigerClient> {
    const logInSpinner = ora();
    let tigerClient = createTigerClient(hostname);
    try {
        // check if authorization is even necessary by trying a client without credentials
        const hasAccess = await probeAccess(tigerClient, projectIdFromConfig);

        if (!hasAccess) {
            if (usernameFromConfig) {
                log("Username", usernameFromConfig);
            }

            const username = usernameFromConfig || (await promptUsername());
            const password = passwordFromConfig || (await promptPassword());

            logInSpinner.start("Logging in...");

            tigerClient = createTigerClient(hostname!, username, password);

            // test that the provided credentials work
            await probeAccess(tigerClient, projectIdFromConfig);

            logInSpinner.stop();
            clearLine();
        }

        return tigerClient;
    } catch (err) {
        logInSpinner.fail();
        clearLine();

        throw new CatalogExportError(`Unable to log in to platform. The error was: ${err}`, 1);
    }
}

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
    const { projectId, hostname, username, password } = config;

    if (!projectId) {
        throw new CatalogExportError(
            "Please specify workspace identifier in either .gdcatalogrc or via the --project-id argument.",
            1,
        );
    }

    const tigerClient = await getTigerClient(hostname!, username, password, projectId);

    const projectSpinner = ora();
    try {
        // await is important here, otherwise errors thrown from the load would not be handled by this catch block
        return await tigerLoad(projectId, tigerClient);
    } catch (err) {
        projectSpinner.stop();

        throw new CatalogExportError(
            `Unable to obtain project metadata from platform. The error was: ${err}`,
            1,
        );
    }
}
