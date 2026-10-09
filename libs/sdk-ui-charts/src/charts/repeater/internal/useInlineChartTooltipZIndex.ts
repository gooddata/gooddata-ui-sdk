// (C) 2026 GoodData Corporation

import { useContainingOverlayZIndex } from "@gooddata/sdk-ui-kit";

import { resolveTooltipZIndex } from "../../../highcharts/tooltipZIndex.js";
import { type IChartConfig } from "../../../interfaces/chartConfig.js";

export function useInlineChartTooltipZIndex(config: IChartConfig | undefined): number {
    const containingOverlayZIndex = useContainingOverlayZIndex();
    return resolveTooltipZIndex({ configZIndex: config?.tooltip?.zIndex, containingOverlayZIndex });
}
