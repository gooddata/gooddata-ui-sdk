// (C) 2007-2023 GoodData Corporation

import {
    CatalogExportConfig,
    CatalogExportError,
    getConfiguredWorkspaceId,
    WorkspaceMetadata,
} from "../../base/types.js";
import { DEFAULT_HOSTNAME } from "../../base/constants.js";
import pkg from "../../../package.json" assert { type: "json" };
import ora from "ora";
import { log, logError } from "../../cli/loggers.js";
import { promptPassword, promptWorkspaceId, promptUsername } from "../../cli/prompts.js";
import { clearLine } from "../../cli/clear.js";
import gooddata, { SDK } from "@gooddata/api-client-bear";
import { bearLoad } from "./bearLoad.js";

async function selectBearWorkspace(client: SDK): Promise<string> {
    const metadataResponse = await client.xhr.get("/gdc/md");
    const metadata = metadataResponse.getData();
    const choices = metadata.about.links.map((link: any) => {
        return {
            name: link.title,
            value: link.identifier,
        };
    });

    return promptWorkspaceId(choices);
}

/**
 * Given the export config, ask for any missing information and then load workspace metadata from
 * a bear project.
 *
 * @param config - tool configuration, may be missing username, password and workspace id - in that case code
 *  will prompt
 *
 * @returns loaded workspace metadata
 *
 * @throws CatalogExportError upon any error.
 */
export async function loadWorkspaceMetadataFromBear(config: CatalogExportConfig): Promise<WorkspaceMetadata> {
    let workspaceId = getConfiguredWorkspaceId(config);

    const { hostname } = config;
    let { username, password } = config;

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
    } catch (err: any) {
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

    const workspaceSpinner = ora();
    try {
        if (workspaceId) {
            log("Project ID", workspaceId);
        } else {
            workspaceId = await selectBearWorkspace(gooddata);
        }

        return bearLoad(workspaceId);
    } catch (err) {
        workspaceSpinner.stop();

        throw new CatalogExportError(
            `Unable to obtain project metadata from platform. The error was: ${err}`,
            1,
        );
    }
}
