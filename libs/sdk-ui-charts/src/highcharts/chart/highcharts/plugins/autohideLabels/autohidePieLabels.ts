// (C) 2007-2018 GoodData Corporation
import get = require("lodash/get");
import fill = require("lodash/fill");

import { getVisibleSeries, getDataPoints, isIntersecting, IRectBySize } from "../../helpers";

// delete this plugin once we upgrade to newer highcharts,
// set allowOverlap: false to get this behaviour

const autohidePieLabels = (chart: any) => {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);
    if (!visiblePoints || visiblePoints.length === 0) {
        return;
    }

    const visibilityMap = fill(Array(visiblePoints.length), true);

    for (let i = 0; i < visiblePoints.length; i++) {
        const actualLabel: IRectBySize = get(visiblePoints, `${i}.dataLabel`);

        // do nothing if label not found or already hidden
        if (!actualLabel || !visibilityMap[i]) {
            continue;
        }

        for (let neighborIdx = i + 1; neighborIdx < visiblePoints.length; neighborIdx++) {
            const neighborLabel: IRectBySize = get(visiblePoints, `${neighborIdx}.dataLabel`);
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
};

export default autohidePieLabels;
