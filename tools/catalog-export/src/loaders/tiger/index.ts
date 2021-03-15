// (C) 2007-2021 GoodData Corporation

import {
    CatalogExportConfig,
    CatalogExportError,
    getConfiguredWorkspaceId,
    getConfiguredWorkspaceName,
    WorkspaceMetadata,
} from "../../base/types";
import ora from "ora";
import { logError, logInfo, logWarn } from "../../cli/loggers";
import { WorkspaceChoices, promptWorkspaceId, promptUsername } from "../../cli/prompts";
import { ITigerClient, jsonApiHeaders } from "@gooddata/api-client-tiger";
import { tigerLoad } from "./tigerLoad";
import { createTigerClient } from "./tigerClient";
import open from "open";
import { JsonApiWorkspaceList } from "@gooddata/api-client-tiger";

/**
 * Tests if the provided tiger client can access the backend.
 * @param tigerClient - tiger client to test
 */
async function probeAccess(tigerClient: ITigerClient): Promise<boolean> {
    try {
        await tigerClient.organizationObjects.getAllEntitiesWorkspaces(
            { page: 0, size: 1 },
            { headers: jsonApiHeaders },
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
async function getTigerClient(hostname: string, usernameFromConfig: string | null): Promise<ITigerClient> {
    const token = getTigerApiToken();
    const hasToken = token !== undefined;
    let askedForLogin: boolean = false;

    const tigerClient = createTigerClient(hostname, token);

    try {
        // check if user has access; if the auth is not enabled, it is no problem that user does not have
        // token set
        const hasAccess = await probeAccess(tigerClient);

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

async function loadWorkspaces(client: ITigerClient): Promise<JsonApiWorkspaceList> {
    const response = await client.organizationObjects.getAllEntitiesWorkspaces(
        {
            page: 0,
            size: 500,
        },
        { headers: jsonApiHeaders },
    );

    return response.data;
}

async function selectWorkspace(client: ITigerClient): Promise<string> {
    const workspaces = await loadWorkspaces(client);

    const choices: WorkspaceChoices[] = workspaces.data.map((ws) => {
        return {
            name: ws.attributes?.name ?? ws.id,
            value: ws.id,
        };
    });

    return promptWorkspaceId(choices, "workspace");
}

async function lookupWorkspaceId(client: ITigerClient, workspaceName: string): Promise<string | null> {
    const workspaces = await loadWorkspaces(client);
    const workspace = workspaces.data.find((ws) => ws.attributes?.name === workspaceName);

    return workspace?.id ?? null;
}

/**
 * Given the export config, ask for any missing information and then load workspace metadata from
 * a tiger workspace.
 *
 * @param config - tool configuration, may be missing username, password and workspace id - in that case code
 *  will prompt
 *
 * @returns loaded workspace metadata
 *
 * @throws CatalogExportError upon any error.
 */
export async function loadWorkspaceMetadataFromTiger(
    config: CatalogExportConfig,
): Promise<WorkspaceMetadata> {
    const { hostname, username } = config;

    const tigerClient = await getTigerClient(hostname!, username);

    let workspaceId = getConfiguredWorkspaceId(config, true);
    const workspaceName = getConfiguredWorkspaceName(config, true);

    if (workspaceName && !workspaceId) {
        workspaceId = await lookupWorkspaceId(tigerClient, workspaceName);

        if (!workspaceId) {
            logWarn(`Workspace with name '${workspaceName}' does not exist.`);
        }
    }

    if (!workspaceId) {
        workspaceId = await selectWorkspace(tigerClient);
    }

    const workspaceSpinner = ora();
    try {
        // await is important here, otherwise errors thrown from the load would not be handled by this catch block
        return await tigerLoad(workspaceId, tigerClient);
    } catch (err) {
        workspaceSpinner.stop();

        throw new CatalogExportError(`Unable to obtain workspace metadata. The error was: ${err}`, 1);
    }
}
