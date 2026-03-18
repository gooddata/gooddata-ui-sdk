// (C) 2026 GoodData Corporation

import {
    type IExecutionDefinition,
    type IInsightDefinition,
    type ISettings,
    type ObjRef,
    insightVisualizationType,
} from "@gooddata/sdk-model";
import { isGeoVisualizationUsingNewEngine, normalizeGeoInsightForRawExport } from "@gooddata/sdk-ui";
import { createExportExecutionDefinition } from "@gooddata/sdk-ui/internal";

type GeoRawExportPreparation = {
    executionDefinition: IExecutionDefinition;
    filledInsight: IInsightDefinition;
};

type GeoRawExportPreparationOptions = {
    baseExecutionDefinition: IExecutionDefinition;
    sourceInsight: IInsightDefinition;
    filledInsight: IInsightDefinition;
    workspace: string;
    settings: ISettings | undefined;
    resolveDefaultDisplayFormRef: (displayFormRef: ObjRef) => ObjRef | undefined;
};

export function prepareGeoRawExportDefinition({
    baseExecutionDefinition,
    sourceInsight,
    filledInsight,
    workspace,
    settings,
    resolveDefaultDisplayFormRef,
}: GeoRawExportPreparationOptions): GeoRawExportPreparation {
    if (!isGeoVisualizationUsingNewEngine(insightVisualizationType(sourceInsight), settings)) {
        return {
            executionDefinition: baseExecutionDefinition,
            filledInsight,
        };
    }

    const preparedExecutionInsight = normalizeGeoInsightForRawExport(sourceInsight, {
        resolveDefaultDisplayFormRef,
    });
    const preparedFilledInsight = normalizeGeoInsightForRawExport(filledInsight, {
        resolveDefaultDisplayFormRef,
    });

    return {
        executionDefinition:
            preparedExecutionInsight === sourceInsight
                ? baseExecutionDefinition
                : createExportExecutionDefinition(
                      preparedExecutionInsight,
                      workspace,
                      baseExecutionDefinition,
                  ),
        filledInsight: preparedFilledInsight,
    };
}
