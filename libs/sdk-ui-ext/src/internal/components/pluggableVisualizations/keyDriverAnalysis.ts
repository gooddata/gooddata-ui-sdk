// (C) 2026 GoodData Corporation

import { type IInsight, type IInsightDefinition, insightProperties } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const isInsightKeyDriverAnalysisEnabled = (
    insight: IInsight | IInsightDefinition | undefined,
): boolean => {
    const visualizationProperties = insight ? insightProperties(insight) : {};
    const controls = visualizationProperties?.["controls"] ?? {};

    return !!insight && !controls.disableKeyDriveAnalysis;
};
