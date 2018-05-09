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

const setWhiteColor = (point: any) => {
    point.dataLabel.element.childNodes[0].style.fill = '#fff';
    point.dataLabel.element.childNodes[0].style['text-shadow'] = 'rgb(0, 0, 0) 0px 0px 1px';
};

const setBlackColor = (point: any) => {
    point.dataLabel.element.childNodes[0].style.fill = '#000';
    point.dataLabel.element.childNodes[0].style['text-shadow'] = 'none';
};

function setLabelsColor(chart: any) {
    const points = flatMap(getVisibleSeries(chart), (series: any) => series.points)
        .filter((point: any) => (point.dataLabel && point.graphic));

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

export function extendDataLabelColors(Highcharts: any) {
    Highcharts.Chart.prototype.callbacks.push((chart: any) => {
        const type = getChartType(chart);

        const changeLabelColor = () => {
            if (type === VisualizationTypes.BAR && !isStacked(chart)) {
                setTimeout(() => {
                    setLabelsColor(chart);
                }, 500);
            }
        };

        changeLabelColor();
        Highcharts.addEvent(chart, 'redraw', changeLabelColor);
    });
}
