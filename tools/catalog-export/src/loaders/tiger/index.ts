// (C) 2007-2021 GoodData Corporation

import { CatalogExportConfig, CatalogExportError, ProjectMetadata } from "../../base/types";
import ora from "ora";
import { logError, logInfo } from "../../cli/loggers";
import { promptUsername } from "../../cli/prompts";
import { ITigerClient, jsonApiHeaders } from "@gooddata/api-client-tiger";
import { tigerLoad } from "./tigerLoad";
import { createTigerClient } from "./tigerClient";
import open from "open";

/**
 * Tests if the provided tiger client can access the backend.
 * @param tigerClient - tiger client to test
 */
async function probeAccess(tigerClient: ITigerClient, projectId: string): Promise<boolean> {
    try {
        await tigerClient.workspaceObjects.getEntitiesMetrics(
            {
                workspaceId: projectId,
            },
            {
                headers: jsonApiHeaders,
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

const TigerApiTokenVariable = "TIGER_API_TOKEN";

/**
 * Gets token defined in TIGER_API_TOKEN or undefined if no such env variable or the variable contains
 * empty value.
 */
function getTigerApiToken(): string | undefined {
    const token = process.env[TigerApiTokenVariable];

    return token?.length ? token : undefined;
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
    projectIdFromConfig: string,
): Promise<ITigerClient> {
    const token = getTigerApiToken();
    const hasToken = token !== undefined;
    let askedForLogin: boolean = false;

    const tigerClient = createTigerClient(hostname, token);

    try {
        // check if user has access; if the auth is not enabled, it is no problem that user does not have
        // token set
        const hasAccess = await probeAccess(tigerClient, projectIdFromConfig);

        if (!hasAccess) {
            if (hasToken) {
                logError(`It looks like the token you have set in ${TigerApiTokenVariable} has expired.`);
            } else {
                logError(`You do not have the ${TigerApiTokenVariable} environment variable set.`);
            }

            if (!usernameFromConfig) {
                logInfo(
                    "I'm now going to ask you for your Tiger userId and then open your default browser at location " +
                        "where you can obtain a fresh API token.",
                );
            }

            const userId = usernameFromConfig || (await promptUsername("Tiger userId"));
            const tokenUrl = `${hostname}/api/users/${userId}/apiTokens`;
            await open(tokenUrl, { wait: false });

            logInfo(
                `You should now see your default browser open at either ${tokenUrl} or at ` +
                    `your Tiger installation's login page. Once you obtain the token, please set the ${TigerApiTokenVariable} environment variable and try again.`,
            );

            askedForLogin = true;
            throw new CatalogExportError("API token not set or no longer valid.", 1);
        }

        return tigerClient;
    } catch (err) {
        if (askedForLogin) {
            throw err;
        }

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
    const { projectId, hostname, username } = config;

    if (!projectId) {
        throw new CatalogExportError(
            "Please specify workspace identifier in either .gdcatalogrc or via the --project-id argument.",
            1,
        );
    }

    const tigerClient = await getTigerClient(hostname!, username, projectId);

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
