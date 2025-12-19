// (C) 2007-2025 GoodData Corporation

import type Highcharts from "highcharts/esm/highcharts.js";

import {
    type IRectBySize,
    getDataPoints,
    getVisibleSeries,
    isIntersecting,
} from "../../../chartTypes/_chartCreators/helpers.js";

// delete this plugin once we upgrade to newer highcharts,
// set allowOverlap: false to get this behaviour

export const autohidePieLabels = (chart: Highcharts.Chart): void => {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);
    if (!visiblePoints || visiblePoints.length === 0) {
        return;
    }

    const visibilityMap = Array(visiblePoints.length).fill(true);

    for (let i = 0; i < visiblePoints.length; i++) {
        // TODO the as any cast is sketchy, but this is what was in the original lodash/get call
        const actualLabel: IRectBySize = (visiblePoints?.[i] as any)?.dataLabel;

        // do nothing if label not found or already hidden
        if (!actualLabel || !visibilityMap[i]) {
            continue;
        }

        for (let neighborIdx = i + 1; neighborIdx < visiblePoints.length; neighborIdx++) {
            // TODO the as any cast is sketchy, but this is what was in the original lodash/get call
            const neighborLabel: IRectBySize = (visiblePoints?.[neighborIdx] as any)?.dataLabel;
            // do nothing if label not found or already hidden
            if (!neighborLabel || !visibilityMap[neighborIdx]) {
                continue;
            }
            const intersects = isIntersecting(actualLabel, neighborLabel);
            if (intersects) {
                visibilityMap[neighborIdx] = false;
                neighborLabel.hide?.();
            } else {
                neighborLabel.show?.();
            }
        }
    }
};
