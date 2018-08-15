// (C) 2007-2018 GoodData Corporation
import flatMap = require('lodash/flatMap');
import { VisualizationTypes } from '../../../../../constants/visualizationTypes';
import {
    getChartType,
    getVisibleSeries,
    isStacked,
    getDataLabelAttributes,
    getShapeAttributes
} from '../helpers';
import { HEAT_MAP_CATEGORIES_COUNT } from '../../chartOptionsBuilder';
import get = require('lodash/get');

import { parseRGBColorCode } from '../../../utils/color';

const setWhiteColor = (point: any) => {
    point.dataLabel.element.childNodes[0].style.fill = '#fff';
    point.dataLabel.element.childNodes[0].style['text-shadow'] = 'rgb(0, 0, 0) 0px 0px 1px';
};

const setBlackColor = (point: any) => {
    point.dataLabel.element.childNodes[0].style.fill = '#000';
    point.dataLabel.element.childNodes[0].style['text-shadow'] = 'none';
};

function getVisiblePointsWithLabel(chart: any) {
    return flatMap(getVisibleSeries(chart), (series: any) => series.points)
        .filter((point: any) => (point.dataLabel && point.graphic));
}

function setBarDataLabelsColor(chart: any) {
    const points = getVisiblePointsWithLabel(chart);

    return points.forEach((point: any) => {
        const labelDimensions = getDataLabelAttributes(point);
        const barDimensions = getShapeAttributes(point);
        const barRight = barDimensions.x + barDimensions.width;
        const labelLeft = labelDimensions.x;

        if (labelLeft < barRight) {
            setWhiteColor(point);
        } else {
            setBlackColor(point);
        }
    });
}

export const START_DARK_COLOR_INDEX = 5;

function setHeatmapDataLabelsColor(chart: any) {
    const points = getVisiblePointsWithLabel(chart);
    const dataClasses = get(chart, 'colorAxis.0.dataClasses', []);
    const hasDarkColor = dataClasses.length === HEAT_MAP_CATEGORIES_COUNT;
    const colorTickPoints = dataClasses.map(dataClass => (dataClass.from));
    const darkColorThreshold = hasDarkColor ? colorTickPoints[START_DARK_COLOR_INDEX] : null;

    return points.forEach((point: any) => {
        const isDarkCell = darkColorThreshold && point.value >= darkColorThreshold;
        if (isDarkCell) {
            setWhiteColor(point);
        } else {
            setBlackColor(point);
        }
    });
}

export function isWhiteNotContrastEnough(color: string) {
    // to keep first 17 colors from our default palette with white labels
    const HIGHCHARTS_CONTRAST_THRESHOLD = 530;

    const { R, G, B } = parseRGBColorCode(color);
    const lightnessHCH = R + G + B;

    return lightnessHCH > HIGHCHARTS_CONTRAST_THRESHOLD;
}

function setContrastLabelsColor(chart: any) {
    const points = getVisiblePointsWithLabel(chart);

    return points.forEach((point: any) => {
        if (isWhiteNotContrastEnough(point.color)) {
            setBlackColor(point);
        } else {
            setWhiteColor(point);
        }
    });
}

export function extendDataLabelColors(Highcharts: any) {
    Highcharts.Chart.prototype.callbacks.push((chart: any) => {
        const type = getChartType(chart);

        const changeLabelColor = () => {
            if (type === VisualizationTypes.BAR && !isStacked(chart)) {
                setTimeout(() => {
                    setBarDataLabelsColor(chart);
                }, 500);
            } else if (type === VisualizationTypes.HEATMAP) {
                setHeatmapDataLabelsColor(chart);
            } else if (type === VisualizationTypes.TREEMAP) {
                setContrastLabelsColor(chart);
            }
        };

        changeLabelColor();
        Highcharts.addEvent(chart, 'redraw', changeLabelColor);
    });
}
