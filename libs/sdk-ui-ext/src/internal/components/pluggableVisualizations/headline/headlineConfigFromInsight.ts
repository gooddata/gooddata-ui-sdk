// (C) 2023 GoodData Corporation
import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { IChartConfig } from "@gooddata/sdk-ui-charts";

export function headlineConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): IChartConfig {
    if (ctx?.settings?.enableNewHeadline) {
        const separatorsProp = ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {};
        const comparison = insightProperties(insight)?.controls?.comparison || {
            comparison: { enable: true },
        };
        return {
            ...comparison,
            ...separatorsProp,
        };
    }
    return null;
}
