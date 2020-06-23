// (C) 2007-2020 GoodData Corporation
import { CatalogExportError, ProjectMetadata } from "../../base/types";
import { ITigerClient } from "@gooddata/api-client-tiger";
import ora from "ora";
import { logError } from "../../cli/loggers";
import { loadCatalog } from "./tigerCatalog";
import { loadInsights } from "./tigerInsights";
import { loadDateDataSets } from "./tigerDateDatasets";

export async function tigerLoad(projectId: string, tigerClient: ITigerClient): Promise<ProjectMetadata> {
    const spinner = ora();

    try {
        spinner.start("Loading catalog of attributes and metrics…");
        const catalog = await loadCatalog(projectId, tigerClient);
        spinner.succeed("Catalog loaded");

        spinner.start("Loading date data sets…");
        const dateDataSets = await loadDateDataSets(projectId, tigerClient);
        spinner.succeed("Date data sets loaded");

        spinner.start("Loading insights…");
        const insights = await loadInsights(projectId, tigerClient);
        spinner.succeed("Insights loaded");

        return {
            projectId,
            catalog,
            dateDataSets,
            insights,
        };
    } catch (err) {
        spinner.fail();
        const more = err.response ? err.response.url : "";
        logError(`Exception: ${err.message} ${more}\n${err.stack}`);

        throw new CatalogExportError("A fatal error has occurred while loading project metadata", 1);
    }
}
