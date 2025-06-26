// (C) 2007-2025 GoodData Corporation
import {
    getAxesWithCategoriesFromSpaceFillingChart,
    getDataPoints,
    getVisibleSeries,
    isPointVisibleInAxesRanges,
} from "../../../chartTypes/_chartCreators/helpers.js";

import {
    intersectsParentLabel,
    isLabelOverlappingItsShape,
    hideDataLabel,
    showDataLabel,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers.js";

function autohideLabelsOverlappingItsShape(
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    chart: any,
    hideFunction: (point: any) => void = hideDataLabel,
    showFunction: (point: any) => void = showDataLabel,
): void {
    const visibleSeries = getVisibleSeries(chart);
    const visiblePoints = getDataPoints(visibleSeries);

    const zoomableAxes = getAxesWithCategoriesFromSpaceFillingChart(chart);

    visiblePoints.forEach((point: any) => {
        if (point) {
            // bubble chart has two axes but none of them has categories and is affected by zooming
            const isPointVisible =
                zoomableAxes.length <= 0 || isPointVisibleInAxesRanges(point, zoomableAxes);
            if (
                isLabelOverlappingItsShape(point) ||
                intersectsParentLabel(point, visiblePoints) ||
                !isPointVisible
            ) {
                hideFunction(point);
            } else {
                showFunction(point);
            }
        }
    });
}

export default autohideLabelsOverlappingItsShape;
