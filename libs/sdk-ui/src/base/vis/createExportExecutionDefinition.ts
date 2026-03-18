// (C) 2026 GoodData Corporation

import {
    type IExecutionDefinition,
    type IInsightDefinition,
    defWithDimensions,
    defaultDimensionsGenerator,
    newDefForInsight,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export function createExportExecutionDefinition(
    insight: IInsightDefinition,
    workspace: string,
    baseExecutionDefinition: IExecutionDefinition,
): IExecutionDefinition {
    const exportDefinitionTemplate = defWithDimensions(
        newDefForInsight(workspace, insight),
        defaultDimensionsGenerator,
    );

    return {
        ...baseExecutionDefinition,
        buckets: exportDefinitionTemplate.buckets,
        attributes: exportDefinitionTemplate.attributes,
        measures: exportDefinitionTemplate.measures,
        sortBy: exportDefinitionTemplate.sortBy,
        dimensions: exportDefinitionTemplate.dimensions,
    };
}
