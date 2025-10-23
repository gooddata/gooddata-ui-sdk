// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { ContentRect } from "react-measure";

import { ILegendDetails, getLegendDetails } from "@gooddata/sdk-ui-vis-commons";

import { IGeoPushpinChartNextConfig } from "../../types/config.js";
import { IGeoData } from "../../types/shared.js";

/**
 * Hook to extract legend details from configuration.
 *
 * @remarks
 * This hook uses the `getLegendDetails` function from vis-commons to determine:
 * - Legend position (computed based on responsive config and container size)
 * - Whether to render popup legend (`renderPopUp`) - true when width less than 610px with autoPositionWithPopup
 * - Maximum rows for popup collapsed state (`maxRows`) - 1 or 2 based on height
 * - Dialog title (`name`) - from segment attribute name
 *
 * The popup legend is triggered when:
 * - Config has `legend.responsive: "autoPositionWithPopup"`
 * - Container width less than 610px (narrow) OR position is top/bottom
 *
 * @param config - Geo pushpin chart configuration
 * @param geoData - Geographic data containing segment information
 * @param contentRect - Container dimensions from react-measure
 * @returns Legend details or null if cannot be determined
 *
 * @alpha
 */
export function useLegendDetails(
    config: IGeoPushpinChartNextConfig | undefined,
    geoData: IGeoData | null,
    contentRect: ContentRect | undefined,
): ILegendDetails | null {
    return useMemo(() => {
        const position = config?.legend?.position ?? "auto";
        const responsive = config?.legend?.responsive;
        const legendLabel = geoData?.segment?.name;

        return getLegendDetails(
            position,
            responsive ?? false,
            { contentRect, legendLabel },
            config?.respectLegendPosition,
        );
    }, [
        config?.legend?.position,
        config?.legend?.responsive,
        config?.respectLegendPosition,
        geoData?.segment?.name,
        contentRect,
    ]);
}
