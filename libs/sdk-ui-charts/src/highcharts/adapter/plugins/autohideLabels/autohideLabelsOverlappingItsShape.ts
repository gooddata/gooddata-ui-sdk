// (C) 2007-2025 GoodData Corporation
import {
    hideDataLabel,
    intersectsParentLabel,
    isLabelOverlappingItsShape,
    showDataLabel,
} from "../../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import {
    getAxesWithCategoriesFromSpaceFillingChart,
    getDataPoints,
    getVisibleSeries,
    isPointVisibleInAxesRanges,
} from "../../../chartTypes/_chartCreators/helpers.js";

export function autohideLabelsOverlappingItsShape(
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
