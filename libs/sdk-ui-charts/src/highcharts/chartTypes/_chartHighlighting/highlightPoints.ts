// (C) 2023-2025 GoodData Corporation

import cx from "classnames";
import isEqual from "lodash/isEqual.js";

import { IChartConfig } from "../../../interfaces/index.js";

/**
 * Adds highlighting class to chart points based on provided drill intersections.
 *
 * @param series - chart series
 * @param selectedPoints - selected points defined by drill intersections
 */
export const highlightChartPoints = (series: Highcharts.Series[], config?: IChartConfig) => {
    const { selectedPoints, type } = config;

    if (!selectedPoints?.length) {
        return;
    }

    const borderClassName = ["heatmap", "dependencywheel", "sankey"].includes(type)
        ? "gd-point-highlighted-border"
        : undefined;
    const classNames = cx("gd-point-highlighted", borderClassName);

    series.forEach((seriesItem) => {
        seriesItem.points.forEach((point) => {
            selectedPoints.forEach((selectedPointIntersection) => {
                if (isEqual((point as any).drillIntersection, selectedPointIntersection)) {
                    /**
                     * In case of waterfall chart, we make sure that the `x` value is not changed.
                     * For some reason it was always changed after any class update and categories were reordered and moved.
                     */
                    const xValueObj = type === "waterfall" ? { x: point.x } : {};

                    point.update({ className: classNames, ...xValueObj }, true);
                }
            });
        });
    });
};

/**
 * Returns classname for the whole series to change opacity of all other points at once.
 */
export const getSeriesHighlightingClassNameObj = (config?: IChartConfig) => {
    return config?.selectedPoints?.length ? { className: "gd-highlighting" } : {};
};
