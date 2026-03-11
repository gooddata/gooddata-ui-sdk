// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type ContentRect } from "react-measure";

import { getLegendDetails } from "@gooddata/sdk-ui-vis-commons";

import { type GeoLegendPosition } from "../../types/config/legend.js";
import { type IGeoChartConfig } from "../../types/config/unified.js";
import { type IGeoCommonData } from "../../types/geoData/common.js";
import { normalizeGeoLegendPosition } from "../../utils/legend/geoLegendPosition.js";

interface IGeoLegendDetails {
    position: GeoLegendPosition;
}

function mapEdgeLegendPositionToGeoCorner(
    position: "top" | "right" | "bottom" | "left" | "auto",
): GeoLegendPosition {
    switch (position) {
        case "left":
            return "top-left";
        case "bottom":
            return "bottom-right";
        case "top":
        case "right":
        case "auto":
        default:
            return "top-right";
    }
}

/**
 * Hook to extract legend details from configuration.
 *
 * @remarks
 * Explicit geo corner positions are honored directly.
 * The shared vis-commons legend heuristics are used only for the geo `"auto"` mode.
 *
 * @param config - Geo pushpin chart configuration
 * @param geoData - Geographic data containing segment information
 * @param contentRect - Container dimensions from react-measure
 * @returns Geo legend details or null if container size is still unknown for responsive auto mode
 *
 * @internal
 */
export function useLegendDetails(
    config: IGeoChartConfig | undefined,
    geoData: IGeoCommonData | null,
    contentRect: ContentRect | undefined,
): IGeoLegendDetails | null {
    return useMemo(() => {
        const normalizedPosition = normalizeGeoLegendPosition(config?.legend?.position);
        const responsive = config?.legend?.responsive;
        const legendLabel = geoData?.segment?.name;

        if (normalizedPosition !== "auto") {
            return {
                position: normalizedPosition,
            };
        }

        if (responsive !== "autoPositionWithPopup") {
            return {
                position: "top-right",
            };
        }

        const legendDetails = getLegendDetails(
            "top",
            responsive,
            { contentRect, legendLabel },
            config?.respectLegendPosition,
        );

        if (!legendDetails) {
            return null;
        }

        return {
            position: mapEdgeLegendPositionToGeoCorner(legendDetails.position),
        };
    }, [
        config?.legend?.position,
        config?.legend?.responsive,
        config?.respectLegendPosition,
        geoData?.segment?.name,
        contentRect,
    ]);
}
