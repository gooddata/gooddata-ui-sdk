// (C) 2007-2022 GoodData Corporation

import {
    CatalogExportConfig,
    CatalogExportError,
    getConfiguredWorkspaceId,
    getConfiguredWorkspaceName,
    WorkspaceMetadata,
} from "../../base/types";
import ora from "ora";
import { logError, logInfo, logWarn } from "../../cli/loggers";
import { WorkspaceChoices, promptWorkspaceId } from "../../cli/prompts";
import { ITigerClient, jsonApiHeaders, JsonApiWorkspaceOutList } from "@gooddata/api-client-tiger";
import { tigerLoad } from "./tigerLoad";
import { createTigerClient } from "./tigerClient";
import open from "open";
import dotenv from "dotenv";

/**
 * Tests if the provided tiger client can access the backend.
 * @param client - tiger client to test
 */
async function probeAccess(client: ITigerClient): Promise<boolean> {
    try {
        await client.entities.getAllEntitiesWorkspaces({ page: 0, size: 1 }, { headers: jsonApiHeaders });

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
    dotenv.config({ path: ".env" });
    const token = process.env[TigerApiTokenVariable];

    return token?.length ? token : undefined;
}

/**
 * Gets the tiger client asking for credentials if they are needed.
 * @param hostname - hostname to use
 * @param usernameFromConfig - username that may have been provided in a config or CLI
 */
async function getTigerClient(config: CatalogExportConfig): Promise<ITigerClient> {
    const token = getTigerApiToken();
    const hasToken = token !== undefined;
    let askedForLogin: boolean = false;

    const client = createTigerClient(config.hostname!, token);

    if (config.demo) {
        return client;
    }

    try {
        // check if user has access; if the auth is not enabled, it is no problem that user does not have
        // token set
        const hasAccess = await probeAccess(client);
        const settingsPage = `${config.hostname!.replace(/\/$/, "")}/settings`;

        if (!hasAccess) {
            if (hasToken) {
                logError(`It looks like the token you have set in ${TigerApiTokenVariable} has expired.`);
            } else {
                logError(`You do not have the ${TigerApiTokenVariable} environment variable set.`);
            }

            logInfo("To obtain a token value, follow these steps:");

            logInfo(
                "1. You should now see your default browser open at either your Tiger developer settings page " +
                    "or login page (if so, please log in).",
            );

            logInfo(
                "2. Once you are on your Tiger developer settings page please " +
                    `create a new personal access token by clicking Manage button in Personal access tokens section. ` +
                    "For other methods to generate the token see: https://www.gooddata.com/developers/cloud-native/doc/latest/administration/auth/user-token ",
            );

            logInfo(
                `3. Once you have the token value, please set the ${TigerApiTokenVariable} environment variable and try again.`,
            );

            await open(settingsPage, { wait: false });

            askedForLogin = true;
            throw new CatalogExportError("API token not set or no longer valid.", 1);
        }

        return client;
    } catch (err) {
        if (askedForLogin) {
            throw err;
        }

        throw new CatalogExportError(`Unable to log in to platform. The error was: ${err}`, 1);
    }
}

async function loadWorkspaces(client: ITigerClient): Promise<JsonApiWorkspaceOutList> {
    const response = await client.entities.getAllEntitiesWorkspaces(
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
    const client = await getTigerClient(config);

    let workspaceId = getConfiguredWorkspaceId(config, true);
    const workspaceName = getConfiguredWorkspaceName(config, true);

    if (workspaceName && !workspaceId) {
        workspaceId = await lookupWorkspaceId(client, workspaceName);

        if (!workspaceId) {
            logWarn(`Workspace with name '${workspaceName}' does not exist.`);
        }
    }

    if (!workspaceId && !config.demo) {
        workspaceId = await selectWorkspace(client);
    } else if (!workspaceId && config.demo) {
        logError(
            "Unable to get workspaceId. Please set workspaceId in your configuration file or provide it with --workspace-id parameter.",
        );
    }

    const workspaceSpinner = ora();
    try {
        // await is important here, otherwise errors thrown from the load would not be handled by this catch block
        return await tigerLoad(client, workspaceId!);
    } catch (err) {
        workspaceSpinner.stop();

        throw new CatalogExportError(`Unable to obtain workspace metadata. The error was: ${err}`, 1);
    }
}
