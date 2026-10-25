// (C) 2026 GoodData Corporation

import {
    type IExecutionDefinition,
    type IInsightDefinition,
    defWithDimensions,
    defaultDimensionsGenerator,
    newDefForInsight,
} from "@gooddata/sdk-model";

export function createRawExportExecutionDefinition(
    projectId: string,
    insight: IInsightDefinition,
): IExecutionDefinition {
    return defWithDimensions(newDefForInsight(projectId, insight), defaultDimensionsGenerator);
}
