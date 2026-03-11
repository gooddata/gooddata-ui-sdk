// (C) 2025-2026 GoodData Corporation

import type {
    GeoLegendCornerPosition,
    GeoLegendPosition,
    LegacyGeoLegendPosition,
} from "../../types/config/legend.js";

const LEGACY_GEO_LEGEND_POSITION_TO_CORNER: Record<LegacyGeoLegendPosition, GeoLegendCornerPosition> = {
    left: "top-left",
    right: "top-right",
    top: "top-right",
    bottom: "bottom-right",
};

function isGeoLegendCornerPosition(position: string): position is GeoLegendCornerPosition {
    return (
        position === "top-left" ||
        position === "top-right" ||
        position === "bottom-left" ||
        position === "bottom-right"
    );
}

function isLegacyGeoLegendPosition(position: string): position is LegacyGeoLegendPosition {
    return position === "top" || position === "right" || position === "bottom" || position === "left";
}

/**
 * Normalizes stored geo legend position values to the corner-based model.
 *
 * @remarks
 * Legacy edge-based values are mapped to preserve the current rendered layout.
 *
 * @internal
 */
export function normalizeGeoLegendPosition(position: string | undefined): GeoLegendPosition {
    if (!position || position === "auto") {
        return "auto";
    }

    if (isGeoLegendCornerPosition(position)) {
        return position;
    }

    if (isLegacyGeoLegendPosition(position)) {
        return LEGACY_GEO_LEGEND_POSITION_TO_CORNER[position];
    }

    return "auto";
}
