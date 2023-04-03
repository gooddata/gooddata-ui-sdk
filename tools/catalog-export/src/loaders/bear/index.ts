// (C) 2007-2022 GoodData Corporation

import {
    CatalogExportConfig,
    CatalogExportError,
    getConfiguredWorkspaceId,
    getConfiguredWorkspaceName,
    WorkspaceMetadata,
} from "../../base/types";
import { DEFAULT_HOSTNAME } from "../../base/constants";
import * as pkg from "../../../package.json";
import ora from "ora";
import { log, logError } from "../../cli/loggers";
import { promptPassword, promptWorkspaceId, promptUsername } from "../../cli/prompts";
import { clearLine } from "../../cli/clear";
import gooddata, { SDK } from "@gooddata/api-client-bear";
import { bearLoad } from "./bearLoad";

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
    const workspaceName = getConfiguredWorkspaceName(config);
    let workspaceId = getConfiguredWorkspaceId(config);

    const { hostname, demo } = config;
    let { username, password } = config;

    gooddata.config.setCustomDomain(hostname || DEFAULT_HOSTNAME);
    gooddata.config.setJsPackage(pkg.name, pkg.version);

    if (!demo) {
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
    } else {
        throw new CatalogExportError(
            "Demo option is supported for GoodData Cloud only (--backend option must be set to tiger).",
            1,
        );
    }

    const workspaceSpinner = ora();
    try {
        if (workspaceName && !workspaceId) {
            log("Project Name", workspaceName);
            workspaceSpinner.start("Loading project");
            const metadataResponse = await gooddata.xhr.get("/gdc/md");
            const metadata = metadataResponse.getData();
            workspaceSpinner.stop();
            const workspaceMetadata = metadata.about
                ? metadata.about.links.find((link: any) => {
                      return link.title === workspaceName;
                  })
                : null;
            if (workspaceMetadata) {
                workspaceId = workspaceMetadata.identifier;
            } else {
                logError(`Could not find a project with name '${workspaceName}'`);
            }
        }
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
