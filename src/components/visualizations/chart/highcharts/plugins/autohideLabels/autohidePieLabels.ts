// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');

import {
    getVisibleSeries,
    getDataPoints,
    isIntersecting
} from '../../helpers';

// delete this plugin once we upgrade to newer highcharts,
// set allowOverlap: false to get this behaviour

const autohidePieLabels = (chart: any) => {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);
    if (!visiblePoints || visiblePoints.length === 0) {
        return;
    }

    let lastVisibleLabel = get(visiblePoints, '0.dataLabel');
    if (!lastVisibleLabel) {
        return;
    }

    for (let i = 1; i < visiblePoints.length; i++) {
        const actualLabel: any = get(visiblePoints, `${i}.dataLabel`);

        // do nothing if label not found
        if (!actualLabel) {
            continue;
        }

        const intersects = isIntersecting(lastVisibleLabel, actualLabel);
        if (!intersects) {
            lastVisibleLabel = actualLabel;
            actualLabel.show();
        } else {
            actualLabel.hide();
        }
    }
};

export default autohidePieLabels;
