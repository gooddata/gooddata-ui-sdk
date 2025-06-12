// (C) 2023 GoodData Corporation
import { IInsightDefinition, insightProperties } from "@gooddata/sdk-model";
import { IChartConfig } from "@gooddata/sdk-ui-charts";

import { IEmbeddingCodeContext } from "../../../interfaces/VisualizationDescriptor.js";
import { HEADLINE_DEFAULT_CONTROL_PROPERTIES } from "../../../constants/supportedProperties.js";
import { getComparisonColorPalette } from "../../../utils/uiConfigHelpers/headlineUiConfigHelper.js";

export function headlineConfigFromInsight(
    insight: IInsightDefinition,
    ctx: IEmbeddingCodeContext | undefined,
): IChartConfig {
    if (ctx?.settings?.enableNewHeadline) {
        const includeColorPalette = ctx?.backend?.capabilities.supportsCustomColorPalettes ?? false;

        const separatorsProp = ctx?.settings?.separators ? { separators: ctx?.settings?.separators } : {};
        const colorPalette = getComparisonColorPalette(ctx?.theme);
        const comparison =
            insightProperties(insight)?.controls?.comparison ||
            HEADLINE_DEFAULT_CONTROL_PROPERTIES.comparison;

        return {
            comparison,
            ...(colorPalette && includeColorPalette ? { colorPalette } : {}),
            ...separatorsProp,
        };
    }
    return null;
}
