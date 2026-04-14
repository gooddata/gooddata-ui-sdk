// (C) 2026 GoodData Corporation

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type ICatalogAttribute,
    type IInsightDefinition,
    type ISettings,
    defWithDimensions,
    defaultDimensionsGenerator,
    newDefForInsight,
} from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type IExportFunction,
    type IExtendedExportConfig,
    createExportFunction,
    prepareGeoInsightForDataExport,
} from "@gooddata/sdk-ui";
import { createExportExecutionDefinition } from "@gooddata/sdk-ui/internal";

/**
 * Creates an export function for geo charts that normalizes the execution before exporting,
 * replacing geo-specific display forms (lat/lng, area codes) with human-readable labels.
 *
 * Same flow as AD (export_report_sagas) and Dashboard (exportInsightWidgetHandler):
 * 1. Load catalog attributes
 * 2. `prepareGeoInsightForDataExport` to get table insight with human-readable labels
 * 3. `createExportExecutionDefinition` to build normalized execution
 * 4. Execute + export
 *
 * @internal
 */
export function createGeoExportFunction(
    backend: IAnalyticalBackend,
    workspace: string,
    dataView: DataViewFacade,
    insight: IInsightDefinition,
    settings: ISettings | undefined,
    exportTitle?: string,
): IExportFunction {
    const fallbackExport = createExportFunction(dataView.result(), exportTitle);

    // The new geo chart is already running, so the new engine flags must be true.
    // Ensure they are set explicitly in case workspace settings omit them.
    const effectiveSettings: ISettings = {
        ...settings,
        enableNewGeoPushpin: settings?.enableNewGeoPushpin ?? true,
        enableGeoArea: settings?.enableGeoArea ?? true,
    };

    return async (exportConfig: IExtendedExportConfig) => {
        try {
            const catalog = await backend.workspace(workspace).catalog().forTypes(["attribute"]).load();
            const catalogAttributes: ICatalogAttribute[] = catalog.attributes();

            const preparedInsight =
                prepareGeoInsightForDataExport(insight, {
                    settings: effectiveSettings,
                    catalogAttributes,
                }) ?? insight;

            if (preparedInsight === insight) {
                return fallbackExport(exportConfig);
            }

            const baseDefinition = defWithDimensions(
                newDefForInsight(workspace, insight),
                defaultDimensionsGenerator,
            );
            const exportDefinition = createExportExecutionDefinition(
                preparedInsight,
                workspace,
                baseDefinition,
            );

            const executionResult = await backend
                .workspace(workspace)
                .execution()
                .forDefinition(exportDefinition)
                .execute();

            return createExportFunction(executionResult, exportTitle)(exportConfig);
        } catch {
            return fallbackExport(exportConfig);
        }
    };
}
