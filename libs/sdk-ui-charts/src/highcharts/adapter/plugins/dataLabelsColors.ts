// (C) 2007-2025 GoodData Corporation

import flatMap from "lodash/flatMap.js";

import { ITheme } from "@gooddata/sdk-model";
import { VisualizationTypes } from "@gooddata/sdk-ui";
import { getContrastRatio, getRgbFromWebColor, parseRGBColorCode } from "@gooddata/sdk-ui-vis-commons";

import { getDataLabelAttributes } from "../../chartTypes/_chartCreators/dataLabelsHelpers.js";
import {
    getChartType,
    getShapeAttributes,
    getVisibleSeries,
    isStacked,
} from "../../chartTypes/_chartCreators/helpers.js";
import { isOneOfTypes } from "../../chartTypes/_util/common.js";
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

const changeDataLabelsColor = (condition: boolean, point: any, theme: ITheme) => {
    const whiteLabelStyle = getWhiteLabelStyle(theme);
    if (condition) {
        setWhiteColor(point, whiteLabelStyle.color, whiteLabelStyle["textShadow"]);
    } else {
        setContrastColor(point);
    }
};

function getVisiblePointsWithLabel(chart: any) {
    return flatMap(getVisibleSeries(chart), (series: any) => series.points).filter(
        (point: any) => point.dataLabel && point.graphic,
    );
}

function setBarDataLabelsColor(chart: any, theme: ITheme) {
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

function setColumnDataLabelsColor(chart: any, theme: ITheme) {
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

        const { R, G, B } = parseRGBColorCode(backgroundColor);
        const lightnessHCH = R + G + B;

        return lightnessHCH > HIGHCHARTS_CONTRAST_THRESHOLD;
    } else {
        const contrastOfLight = getContrastRatio(backgroundColor, lightColor);
        const contrastOfDark = getContrastRatio(backgroundColor, darkColor);

        return contrastOfLight < contrastOfDark;
    }
}

function setContrastLabelsColor(chart: any, theme: ITheme) {
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

export function extendDataLabelColors(Highcharts: any, theme: ITheme): void {
    Highcharts.Chart.prototype.callbacks.push((chart: any) => {
        const type: string = getChartType(chart);
        const labelsStyle = getDataLabelsStyle(chart);

        const changeLabelColor = () => {
            if (isHighContrastMode()) {
                if (labelsStyle === "backplate") {
                    // Backplate mode: styles already set in config
                    return;
                }
                // In WCHM: Ensure all data labels use system colors
                ensureWCHMDataLabels(chart);
            } else {
                if (labelsStyle === "backplate") {
                    // Backplate mode: styles already set in config
                    return;
                } else {
                    // Normal mode: Use custom color logic
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
                        ])
                    ) {
                        setTimeout(() => {
                            setColumnDataLabelsColor(chart, theme);
                        }, 500);
                    } else if (isOneOfTypes(type, [VisualizationTypes.HEATMAP, VisualizationTypes.TREEMAP])) {
                        setContrastLabelsColor(chart, theme);
                    }
                }
            }
        };

        changeLabelColor();
        Highcharts.addEvent(chart, "redraw", changeLabelColor);
    });
}
