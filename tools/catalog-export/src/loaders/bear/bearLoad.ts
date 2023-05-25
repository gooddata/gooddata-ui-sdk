// (C) 2007-2023 GoodData Corporation
import ora from "ora";
import { logError } from "../../cli/loggers.js";
import { CatalogExportError, WorkspaceMetadata } from "../../base/types.js";
import { loadCatalog } from "./bearCatalog.js";
import { loadDateDataSets } from "./bearDateDatasets.js";
import { loadInsights } from "./bearInsights.js";
import { loadAnalyticalDashboard } from "./bearAnalyticalDashboard.js";

/**
 * Loads all workspace metadata that can be used for exporting into catalog.
 *
 * @param workspaceId - workspace identifier
 * @throws CatalogExportError
 */
export async function bearLoad(workspaceId: string): Promise<WorkspaceMetadata> {
    const spinner = ora();

    try {
        spinner.start("Loading catalog of attributes and metrics…");
        const catalog = await loadCatalog(workspaceId);
        spinner.succeed("Catalog loaded");

        spinner.start("Loading date data sets…");
        const dateDataSets = await loadDateDataSets(workspaceId);
        spinner.succeed("Date data sets loaded");

        spinner.start("Loading insights…");
        const insights = await loadInsights(workspaceId);
        spinner.succeed("Insights loaded");

        spinner.start("Loading analytical dashboards…");
        const analyticalDashboards = await loadAnalyticalDashboard(workspaceId);
        spinner.succeed("Analytical dashboards loaded");
        return {
            workspaceId,
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

        throw new CatalogExportError("A fatal error has occurred while loading project metadata", 1);
    }
}
