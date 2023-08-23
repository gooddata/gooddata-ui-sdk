// (C) 2023 GoodData Corporation
import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { DEFAULT_COMPARISON_PALETTE, IChartConfig } from "@gooddata/sdk-ui-charts";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { HEADLINE_DEFAULT_CONTROL_PROPERTIES } from "../../../constants/supportedProperties.js";

export function headlineConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): IChartConfig {
    if (ctx?.settings?.enableNewHeadline) {
        const separatorsProp = ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {};
        const comparison =
            insightProperties(insight)?.controls?.comparison ||
            HEADLINE_DEFAULT_CONTROL_PROPERTIES.comparison;

        return {
            comparison,
            colorPalette: DEFAULT_COMPARISON_PALETTE,
            ...separatorsProp,
        };
    }
    return null;
}
