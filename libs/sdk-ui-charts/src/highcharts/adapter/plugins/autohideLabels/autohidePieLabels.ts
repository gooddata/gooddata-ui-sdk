// (C) 2007-2025 GoodData Corporation
import fill from "lodash/fill.js";

import {
    getVisibleSeries,
    getDataPoints,
    isIntersecting,
    IRectBySize,
} from "../../../chartTypes/_chartCreators/helpers.js";
import Highcharts from "highcharts/esm/highcharts.js";

// delete this plugin once we upgrade to newer highcharts,
// set allowOverlap: false to get this behaviour

export default function autohidePieLabels(chart: Highcharts.Chart): void {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);
    if (!visiblePoints || visiblePoints.length === 0) {
        return;
    }

    const visibilityMap = fill(Array(visiblePoints.length), true);

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
            if (!intersects) {
                neighborLabel.show();
            } else {
                visibilityMap[neighborIdx] = false;
                neighborLabel.hide();
            }
        }
    }
}
