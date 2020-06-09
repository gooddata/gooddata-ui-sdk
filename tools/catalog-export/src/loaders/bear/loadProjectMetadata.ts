// (C) 2007-2019 GoodData Corporation
import ora from "ora";
import { logError } from "../../cli/loggers";
import { CatalogExportError, ProjectMetadata } from "../../base/types";
import { loadCatalog } from "./catalog";
import { loadDateDataSets } from "./dateDataSets";
import { loadInsights } from "./visualization";

/**
 * Loads all project metadata that can be used for exporting into catalog.
 *
 * @param projectId - project identifier
 * @throws CatalogExportError
 */
export async function loadProjectMetadata(projectId: string): Promise<ProjectMetadata> {
    const spinner = ora();

    try {
        spinner.start("Loading catalog of attributes and metrics…");
        const catalog = await loadCatalog(projectId);
        spinner.succeed("Catalog loaded");

        spinner.start("Loading date data sets…");
        const dateDataSets = await loadDateDataSets(projectId);
        spinner.succeed("Date data sets loaded");

        spinner.start("Loading insights…");
        const insights = await loadInsights(projectId);
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
