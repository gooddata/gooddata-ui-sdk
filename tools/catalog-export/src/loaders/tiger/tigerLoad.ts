// (C) 2007-2026 GoodData Corporation

import ora from "ora";

import { type ITigerClient } from "@gooddata/api-client-tiger";

import { loadAnalyticalDashboards } from "./tigerAnalyticalDashboards.js";
import { loadCatalog } from "./tigerCatalog.js";
import { loadDateDataSets } from "./tigerDateDatasets.js";
import { loadInsights } from "./tigerInsights.js";
import { CatalogExportError, type WorkspaceMetadata } from "../../base/types.js";
import { logError } from "../../cli/loggers.js";

export async function tigerLoad(client: ITigerClient, workspaceId: string): Promise<WorkspaceMetadata> {
    const spinner = ora();

    try {
        spinner.start("Loading catalog of attributes and metrics…");
        const catalog = await loadCatalog(client, workspaceId);
        spinner.succeed("Catalog loaded");

        spinner.start("Loading date data sets…");
        const dateDataSets = await loadDateDataSets(client, workspaceId);
        spinner.succeed("Date data sets loaded");

        spinner.start("Loading insights…");
        const insights = await loadInsights(client, workspaceId);
        spinner.succeed("Insights loaded");

        spinner.start("Loading analytical dashboards…");
        const analyticalDashboards = await loadAnalyticalDashboards(client, workspaceId);
        spinner.succeed("Analytical dashboards loaded");

        return {
            workspaceId: workspaceId,
            catalog,
            dateDataSets,
            insights,
            analyticalDashboards,
        };
    } catch (err: any) {
        spinner.fail();
        if (err?.response?.status === 404) {
            // handle known error more gracefully to avoid general-type error messages
            logError(
                `Workspace with id '${workspaceId}' was not found. Please make sure you are passing a correct value to the 'workspace-id' argument.`,
            );
            process.exit(1);
        }

        const more = err.response ? err.response.url : "";
        logError(`Exception: ${err.message} ${more}\n${err.stack}`);

        throw new CatalogExportError("A fatal error has occurred while loading workspace metadata", 1);
    }
}
