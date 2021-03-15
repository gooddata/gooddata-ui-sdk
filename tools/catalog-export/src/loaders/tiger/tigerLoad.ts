// (C) 2007-2021 GoodData Corporation
import { CatalogExportError, WorkspaceMetadata } from "../../base/types";
import { ITigerClient } from "@gooddata/api-client-tiger";
import ora from "ora";
import { logError } from "../../cli/loggers";
import { loadCatalog } from "./tigerCatalog";
import { loadInsights } from "./tigerInsights";
import { loadDateDataSets } from "./tigerDateDatasets";
import { loadAnalyticalDashboards } from "./tigerAnalyticalDashboards";

export async function tigerLoad(workspaceId: string, tigerClient: ITigerClient): Promise<WorkspaceMetadata> {
    const spinner = ora();

    try {
        spinner.start("Loading catalog of attributes and metrics…");
        const catalog = await loadCatalog(workspaceId, tigerClient);
        spinner.succeed("Catalog loaded");

        spinner.start("Loading date data sets…");
        const dateDataSets = await loadDateDataSets(workspaceId, tigerClient);
        spinner.succeed("Date data sets loaded");

        spinner.start("Loading insights…");
        const insights = await loadInsights(workspaceId, tigerClient);
        spinner.succeed("Insights loaded");

        spinner.start("Loading analytical dashboards");
        const analyticalDashboards = await loadAnalyticalDashboards(workspaceId, tigerClient);
        spinner.succeed("Analytical dashboards loaded");

        return {
            workspaceId: workspaceId,
            catalog,
            dateDataSets,
            insights,
            analyticalDashboards,
        };
    } catch (err) {
        spinner.fail();
        const more = err.response ? err.response.url : "";
        logError(`Exception: ${err.message} ${more}\n${err.stack}`);

        throw new CatalogExportError("A fatal error has occurred while loading workspace metadata", 1);
    }
}
