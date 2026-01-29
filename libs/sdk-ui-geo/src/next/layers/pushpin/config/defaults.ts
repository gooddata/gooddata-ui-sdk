// (C) 2025-2026 GoodData Corporation

import { type IGeoChartConfig } from "../../../types/config/unified.js";

type ConfigWithPoints = IGeoChartConfig & {
    points: NonNullable<IGeoChartConfig["points"]>;
};

/**
 * Applies pushpin-specific defaults (points sizing/clustering).
 *
 * @internal
 */
export function applyPushpinConfigDefaults<T extends IGeoChartConfig>(config: T): T & ConfigWithPoints {
    const points = config.points ?? {};

    return {
        ...config,
        points: {
            ...points,
            minSize: points.minSize ?? "normal",
            maxSize: points.maxSize ?? "normal",
            groupNearbyPoints: points.groupNearbyPoints ?? true,
        },
    };
}
