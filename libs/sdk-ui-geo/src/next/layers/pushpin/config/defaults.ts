// (C) 2025 GoodData Corporation

import { IGeoChartNextConfig } from "../../../types/config/unified.js";

type ConfigWithPoints = IGeoChartNextConfig & {
    points: NonNullable<IGeoChartNextConfig["points"]>;
};

/**
 * Applies pushpin-specific defaults (points sizing/clustering).
 *
 * @internal
 */
export function applyPushpinConfigDefaults<T extends IGeoChartNextConfig>(config: T): T & ConfigWithPoints {
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
