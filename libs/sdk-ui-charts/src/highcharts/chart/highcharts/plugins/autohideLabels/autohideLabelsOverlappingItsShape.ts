// (C) 2007-2018 GoodData Corporation
import { getDataPoints, getVisibleSeries } from "../../helpers";

import {
    intersectsParentLabel,
    isLabelOverlappingItsShape,
    hideDataLabel,
    showDataLabel,
} from "../../dataLabelsHelpers";

function autohideLabelsOverlappingItsShape(
    chart: any,
    hideFunction: (point: any) => void = hideDataLabel,
    showFunction: (point: any) => void = showDataLabel,
) {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);

    visiblePoints.forEach((point: any) => {
        if (point) {
            if (isLabelOverlappingItsShape(point) || intersectsParentLabel(point, visiblePoints)) {
                hideFunction(point);
            } else {
                showFunction(point);
            }
        }
    });
}

export default autohideLabelsOverlappingItsShape;
