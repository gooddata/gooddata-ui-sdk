// (C) 2007-2026 GoodData Corporation

import { type ITheme } from "@gooddata/sdk-model";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { getContrastRatio, getRgbFromWebColor } from "@gooddata/sdk-ui-vis-commons";

import { getDataLabelAttributes } from "../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import {
    getChartType,
    getResolvedPiePosition,
    getShapeAttributes,
    getVisibleSeries,
    isStacked,
} from "../../chartTypes/_chartCreators/helpers.js";
import { MEKKO_SERIES_TYPE, isOneOfTypes } from "../../chartTypes/_util/common.js";
import { getBlackLabelStyle, getWhiteLabelStyle } from "../../constants/label.js";
import { isHighContrastMode } from "../../utils/highContrastMode.js";

const setWhiteColor = (point: any, color: string = "#fff", textShadow?: string | number | boolean) => {
    point.dataLabel.element.childNodes[0].style.fill = color;
    point.dataLabel.element.childNodes[0].style["text-shadow"] = textShadow ?? "rgb(0, 0, 0) 0px 0px 1px";
    point.dataLabel.element.classList.remove("gd-contrast-label");
};

const setBlackColor = (point: any, color: string = "#000") => {
    point.dataLabel.element.childNodes[0].style.fill = color;
    point.dataLabel.element.childNodes[0].style["text-shadow"] = "none";
    point.dataLabel.element.classList.remove("gd-contrast-label");
};

const setContrastColor = (point: any) => {
    point.dataLabel.element.childNodes[0].style.fill = "";
    point.dataLabel.element.childNodes[0].style["text-shadow"] = "none";
    point.dataLabel.element.classList.add("gd-contrast-label");
};

const changeDataLabelsColor = (condition: boolean, point: any, theme: ITheme | null) => {
    const whiteLabelStyle = getWhiteLabelStyle(theme);
    if (condition) {
        setWhiteColor(point, whiteLabelStyle.color, whiteLabelStyle["textShadow"]);
    } else {
        setContrastColor(point);
    }
};

function getVisiblePointsWithLabel(chart: any) {
    return (
        getVisibleSeries(chart)
            ?.flatMap((series) => series.points)
            ?.filter((point: any) => point.dataLabel && point.graphic) ?? []
    );
}

function setBarDataLabelsColor(chart: any, theme: ITheme | null) {
    const points = getVisiblePointsWithLabel(chart);

    return points.forEach((point: any) => {
        const labelDimensions = getDataLabelAttributes(point);
        const barDimensions = getShapeAttributes(point);
        const barRight = barDimensions.x + barDimensions.width;
        const barLeft = barDimensions.x;
        const labelLeft = labelDimensions.x;
        const lightStyle = getWhiteLabelStyle(theme);

        if (point.negative) {
            if (labelLeft > barLeft) {
                // labelRight is overlapping bar even it is outside of it
                setWhiteColor(point, lightStyle.color, lightStyle["textShadow"]);
            } else {
                setContrastColor(point);
            }
        } else {
            if (labelLeft < barRight) {
                setWhiteColor(point, lightStyle.color, lightStyle["textShadow"]);
            } else {
                setContrastColor(point);
            }
        }
    });
}

function setColumnDataLabelsColor(chart: any, theme: ITheme | null) {
    const points = getVisiblePointsWithLabel(chart);

    return points
        .filter((point: any) => point.shapeArgs) // skip if shapeArgs missing (such as line points in line/column combo chart)
        .forEach((point: any) => {
            const labelDimensions = getDataLabelAttributes(point);
            const columnDimensions = getShapeAttributes(point);
            const columnTop = columnDimensions.y + columnDimensions.height;
            const columnDown = columnDimensions.y;
            const labelDown = labelDimensions.y;

            if (point.negative) {
                changeDataLabelsColor(labelDown < columnDown, point, theme);
            } else if (isStacked(chart)) {
                changeDataLabelsColor(labelDown < columnTop, point, theme);
            } else {
                changeDataLabelsColor(labelDown > columnTop, point, theme);
            }
        });
}
const isWhiteColor = (color: string) => {
    const rgb = getRgbFromWebColor(color);
    return rgb?.r === 255 && rgb?.g === 255 && rgb?.b === 255;
};

export function isLightNotContrastEnough(
    backgroundColor: string,
    lightColor: string = "#fff",
    darkColor: string = "#000",
): boolean {
    // keep old logic for white labels
    if (isWhiteColor(lightColor)) {
        // to keep first 17 colors from our default palette with white labels
        const HIGHCHARTS_CONTRAST_THRESHOLD = 530;

        const rgb = getRgbFromWebColor(backgroundColor);
        const lightnessHCH = (rgb?.r ?? 0) + (rgb?.g ?? 0) + (rgb?.b ?? 0);

        return lightnessHCH > HIGHCHARTS_CONTRAST_THRESHOLD;
    } else {
        const contrastOfLight = getContrastRatio(backgroundColor, lightColor);
        const contrastOfDark = getContrastRatio(backgroundColor, darkColor);

        return contrastOfLight < contrastOfDark;
    }
}

function setContrastLabelsColor(chart: any, theme: ITheme | null) {
    const points = getVisiblePointsWithLabel(chart);
    const lightStyle = getWhiteLabelStyle(theme);
    const darkColor = getBlackLabelStyle(theme).color;

    return points.forEach((point: any) => {
        if (isLightNotContrastEnough(point.color, lightStyle.color, darkColor)) {
            setBlackColor(point, darkColor);
        } else {
            setWhiteColor(point, lightStyle.color, lightStyle["textShadow"]);
        }
    });
}

// Applies per-slice contrast to every inside label. Bypasses the theme's autoLightTextColor/
// autoDarkTextColor so pie inside labels stay readable even if the workspace theme misconfigures
// those to dark values (contrast decision uses hardcoded white/black).
function setPieInsideLabelsContrast(chart: Highcharts.Chart): void {
    getVisiblePointsWithLabel(chart).forEach((point: any) => {
        if (isLightNotContrastEnough(point.color)) {
            setBlackColor(point);
        } else {
            setWhiteColor(point);
        }
    });
}

// Function to ensure all data labels respect WCHM
function ensureWCHMDataLabels(chart: any) {
    if (isHighContrastMode()) {
        const points = getVisiblePointsWithLabel(chart);
        points.forEach((point: any) => {
            if (point.dataLabel?.element) {
                // Remove any hardcoded colors to let WCHM handle them
                point.dataLabel.element.childNodes[0].style.removeProperty("fill");
                point.dataLabel.element.childNodes[0].style.removeProperty("text-shadow");
                point.dataLabel.element.childNodes[0].style.removeProperty("color");

                // Also remove any CSS classes that might override colors
                point.dataLabel.element.classList.remove("gd-contrast-label");
            }
        });

        // Also check for any data labels that might not be in points
        chart.series.forEach((series: any) => {
            if (series.dataLabels) {
                series.dataLabels.forEach((dataLabel: any) => {
                    if (dataLabel.element) {
                        dataLabel.element.style.removeProperty("fill");
                        dataLabel.element.style.removeProperty("text-shadow");
                        dataLabel.element.style.removeProperty("color");
                    }
                });
            }
        });
    }
}

function getDataLabelsStyle(chart: any) {
    return chart.options.plotOptions?.gdcOptions?.dataLabels?.style;
}

function isDonutDataLabelsEnabled(chart: Highcharts.Chart): boolean {
    const plotOptions = chart.options.plotOptions as
        | { gdcOptions?: { enableDonutDataLabels?: boolean } }
        | undefined;
    return plotOptions?.gdcOptions?.enableDonutDataLabels === true;
}

function applyNormalModeColorLogic(chart: any, type: string | undefined, theme: ITheme | null): void {
    if (type === VisualizationTypes.BAR) {
        setTimeout(() => {
            setBarDataLabelsColor(chart, theme);
        }, 500);
    } else if (
        isOneOfTypes(type, [
            VisualizationTypes.COLUMN,
            VisualizationTypes.PIE,
            VisualizationTypes.FUNNEL,
            VisualizationTypes.PYRAMID,
            MEKKO_SERIES_TYPE,
        ])
    ) {
        setTimeout(() => {
            setColumnDataLabelsColor(chart, theme);
        }, 500);
    } else if (isOneOfTypes(type, [VisualizationTypes.HEATMAP, VisualizationTypes.TREEMAP])) {
        setContrastLabelsColor(chart, theme);
    }
}

export function extendDataLabelColors(Highcharts: any, theme: ITheme | null): void {
    Highcharts.Chart.prototype.callbacks.push((chart: any) => {
        const type = getChartType(chart);
        const labelsStyle = getDataLabelsStyle(chart);

        const changeLabelColor = () => {
            // Backplate style: static config already sets background/border/text — no override
            if (labelsStyle === "backplate") {
                return;
            }

            // WCHM takes precedence over any custom color logic so system colors win
            if (isHighContrastMode()) {
                ensureWCHMDataLabels(chart);
                return;
            }

            // New pie/donut behavior gated behind the enableDonutDataLabels feature flag.
            // Position is resolved once for the whole chart — all labels are either inside or outside.
            const isPieOrDonut = isOneOfTypes(type, [VisualizationTypes.PIE, VisualizationTypes.DONUT]);
            if (isDonutDataLabelsEnabled(chart) && isPieOrDonut) {
                // Outside labels sit on the chart background — static config already sets black text
                if (getResolvedPiePosition(chart) === "outside") {
                    return;
                }
                // Inside labels sit on the colored slice — pick contrasting text per slice
                setPieInsideLabelsContrast(chart);
                return;
            }

            applyNormalModeColorLogic(chart, type, theme);
        };

        changeLabelColor();
        Highcharts.addEvent(chart, "redraw", changeLabelColor);
    });
}
