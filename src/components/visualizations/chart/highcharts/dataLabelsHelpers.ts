// (C) 2007-2018 GoodData Corporation
import flatMap = require('lodash/flatMap');
import get = require('lodash/get');

import {
    isStacked,
    IRectBySize,
    isIntersecting
} from './helpers';

export function isLabelOverlappingItsShape(point: any) {
    const { dataLabel, shapeArgs } = point;
    if (dataLabel && shapeArgs) { // shapeArgs for point hidden by legend is undefined
        if (shapeArgs.width === undefined) {
            return dataLabel.width > (shapeArgs.r * 2) || dataLabel.height > (shapeArgs.r * 2);
        }
        return dataLabel.width > shapeArgs.width || dataLabel.height > shapeArgs.height;
    }
    return false;
}

export const getDataLabelsGdcVisible = (chart: any): boolean | string =>
    get(chart, 'options.plotOptions.gdcOptions.dataLabels.visible', 'auto');

export const areLabelsStacked = (chart: any) =>
    (get(chart, 'userOptions.yAxis.0.stackLabels.enabled', false) && isStacked(chart));

export const hasDataLabel = (point: any) => point.dataLabel;

export const minimizeDataLabel = (point: any) => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.width = 0;
        dataLabel.height = 0;
    }
};

export const hideDataLabel = (point: any) => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.hide();
    }
};

export const showDataLabel = (point: any) => {
    const { dataLabel } = point;
    if (dataLabel) {
        dataLabel.show();
    }
};

export const hideDataLabels = (points: any) => {
    points.filter(hasDataLabel).forEach(hideDataLabel);
};

export const showDataLabels = (points: any) => {
    points.filter(hasDataLabel).forEach(showDataLabel);
};

export const showDataLabelInsideChart = (
    point: any,
    chartBox: IRectBySize,
    showDirection: DirectionToHide
) => {
    const dataLabel = point.dataLabel;
    const dataLabelRec: IRectBySize = getDataLabelAttributes(point);
    const inside: IInsideResult = isDataLabelInsideChart(dataLabelRec, chartBox);
    if (dataLabel && inside.horizontally && inside.vertically) {
        dataLabel.show();
    } else if (inside.vertically && showDirection === 'horizontal') {
        shiftDataLabelHorizontallyInsideChart(dataLabel, chartBox);
    } else if (inside.horizontally && showDirection === 'vertical') {
        shiftDataLabelVerticallyInsideChart(dataLabel, chartBox);
    } else if (dataLabel) {
        dataLabel.hide();
    }
};

function shiftDataLabelVerticallyInsideChart(dataLabel: any, chartBox: IRectBySize) {
    if (dataLabel.y < chartBox.y) {
        dataLabel.ySetter(0);
    }
    if ((dataLabel.y + dataLabel.height) > chartBox.height) {
        dataLabel.ySetter(chartBox.height - dataLabel.height);
    }
}

function shiftDataLabelHorizontallyInsideChart(dataLabel: any, chartBox: IRectBySize) {
    if (dataLabel.x < chartBox.x) {
        dataLabel.xSetter(0);
    }
    if ((dataLabel.x + dataLabel.width) > chartBox.width) {
        dataLabel.xSetter(chartBox.width - dataLabel.width);
    }
}

export function isDataLabelInsideChart(dataLabelRect: IRectBySize, chartBox: IRectBySize): IInsideResult {
    const safePaddingForOnYAxesLabels = 2;
    return {
        vertically: dataLabelRect.y >= chartBox.y &&
            (dataLabelRect.y + dataLabelRect.height) <= (chartBox.y + chartBox.height + safePaddingForOnYAxesLabels),
        horizontally: dataLabelRect.x >= chartBox.x &&
                    (dataLabelRect.x + dataLabelRect.width) <= (chartBox.x + chartBox.width)
    };
}
export interface IInsideResult {
    vertically: boolean;
    horizontally: boolean;
}

export const HORIZONTAL = 'horizontal';
export const VERTICAL = 'vertical';
export type DirectionToHide = 'horizontal' | 'vertical';

export const hideAllLabels = ({ series }: any) => hideDataLabels(flatMap(series, s => s.points));

export const showAllLabels = ({ series }: any) => showDataLabels(flatMap(series, s => s.points));

export function getDataLabelAttributes(point: any): IRectBySize {
    const dataLabel = get(point, 'dataLabel', null);
    const parentGroup = get(point, 'dataLabel.parentGroup', null);

    const labelSafeOffset = -100; // labels outside axis range have typically -9999, hide them
    const labelVisible = dataLabel && dataLabel.x > labelSafeOffset && dataLabel.y > labelSafeOffset;

    if (dataLabel && parentGroup && labelVisible) {
        return {
            x: dataLabel.x + parentGroup.translateX,
            y: dataLabel.y + parentGroup.translateY,
            width: dataLabel.width,
            height: dataLabel.height
        };
    }

    return {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
}

export function intersectsParentLabel(point: any, points: any) {
    const pointParent = parseInt(point.parent, 10);
    if (isNaN(pointParent)) {
        return false;
    }

    const pointLabelShape = point.dataLabel;
    const parentPoint = points[pointParent];
    const parentLabelShape = parentPoint.dataLabel;
    return isIntersecting(pointLabelShape, parentLabelShape);
}
