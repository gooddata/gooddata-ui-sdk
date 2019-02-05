// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import debounce = require('lodash/debounce');
import { AFM } from '@gooddata/typings';
import * as CustomEvent from 'custom-event';
import * as Highcharts from 'highcharts';
import * as invariant from 'invariant';
import { VisElementType, VisType, VisualizationTypes } from '../../../constants/visualizationTypes';
import {
    IDrillEvent,
    DrillEventContext,
    IDrillEventContextGroup,
    IDrillEventIntersectionElement,
    ILegacyDrillIntersection
} from '../../../interfaces/DrillEvents';
import { OnFiredDrillEvent } from '../../../interfaces/Events';
import { TableRowForDrilling } from '../../../interfaces/Table';
import { isComboChart, isHeatmap, isTreemap } from './common';

export interface IHighchartsPointObject extends Highcharts.PointObject {
    drillIntersection: ILegacyDrillIntersection[];
    z?: number; // is missing in HCH's interface
    value?: number; // is missing in HCH's interface
}

export interface IHighchartsChartDrilldownEvent extends Highcharts.ChartDrilldownEvent {
    point?: IHighchartsPointObject;
    points?: IHighchartsPointObject[];
}

export function isGroupHighchartsDrillEvent(event: IHighchartsChartDrilldownEvent) {
    return !!event.points;
}

export interface ICellDrillEvent {
    columnIndex: number;
    rowIndex: number;
    row: TableRowForDrilling;
    intersection: ILegacyDrillIntersection[];
}

export interface IDrillConfig {
    afm: AFM.IAfm;
    onFiredDrillEvent: OnFiredDrillEvent;
}

export function getClickableElementNameByChartType(type: VisType): VisElementType {
    switch (type) {
        case VisualizationTypes.LINE:
        case VisualizationTypes.AREA:
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.BUBBLE:
            return 'point';
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BAR:
            return 'bar';
        case VisualizationTypes.PIE:
        case VisualizationTypes.TREEMAP:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
            return 'slice';
        case VisualizationTypes.TABLE:
        case VisualizationTypes.HEATMAP:
            return 'cell';
        default:
            invariant(false, `Unknown visualization type: ${type}`);
            return null;
    }
}

function fireEvent(onFiredDrillEvent: OnFiredDrillEvent, data: IDrillEvent, target: EventTarget) {
    const returnValue = onFiredDrillEvent(data);

    // if user-specified onFiredDrillEvent fn returns false, do not fire default DOM event
    if (returnValue !== false) {
        const event = new CustomEvent('drill', {
            detail: data,
            bubbles: true
        });
        target.dispatchEvent(event);
    }
}

function normalizeIntersectionElements(intersection: ILegacyDrillIntersection[]): IDrillEventIntersectionElement[] {
    return intersection.map(({ id, title, value, name, uri, identifier }) => {
       const intersection: IDrillEventIntersectionElement = {
           id,
           title: title || value as string || name
       };
       if (uri || identifier) {
           intersection.header = { uri, identifier };
       }
       return intersection;
    });
}

function composeDrillContextGroup(
    { points }: IHighchartsChartDrilldownEvent,
    chartType: VisType
): IDrillEventContextGroup {
    return {
        type: chartType,
        element: 'label',
        points: points.map((point: IHighchartsPointObject) => {
            return {
                x: point.x,
                y: point.y,
                intersection: normalizeIntersectionElements(point.drillIntersection)
            };
        })
    };
}

function composeDrillContextPoint(
    { point }: IHighchartsChartDrilldownEvent,
    chartType: VisType
): DrillEventContext {
    const zProp = isNaN(point.z) ? {} : { z: point.z };
    const valueProp = (isTreemap(chartType) || isHeatmap(chartType)) ? { value: point.value.toString() } : {};
    const xyProp = isTreemap(chartType) ? {} : {
        x: point.x,
        y: point.y
    };
    return {
        type: chartType,
        element: getClickableElementNameByChartType(chartType),
        ...xyProp,
        ...zProp,
        ...valueProp,
        intersection: normalizeIntersectionElements(point.drillIntersection)
    };
}

const chartClickDebounced = debounce((drillConfig: IDrillConfig, event: IHighchartsChartDrilldownEvent,
                                      target: EventTarget, chartType: VisType) => {
    const { afm, onFiredDrillEvent } = drillConfig;

    let usedChartType = chartType;
    if (isComboChart(chartType)) {
        usedChartType = get(event, ['point', 'series', 'options', 'type'], chartType);
    }

    const drillContext: DrillEventContext = isGroupHighchartsDrillEvent(event)
        ? composeDrillContextGroup(event, usedChartType)
        : composeDrillContextPoint(event, usedChartType);

    const data: IDrillEvent = {
        executionContext: afm,
        drillContext
    };

    fireEvent(onFiredDrillEvent, data, target);
});

export function chartClick(drillConfig: IDrillConfig,
                           event: IHighchartsChartDrilldownEvent,
                           target: EventTarget,
                           chartType: VisType) {
    chartClickDebounced(drillConfig, event, target, chartType);
}

export function cellClick(drillConfig: IDrillConfig, event: ICellDrillEvent, target: EventTarget) {
    const { afm, onFiredDrillEvent } = drillConfig;
    const { columnIndex, rowIndex, row, intersection } = event;
    const data: IDrillEvent = {
        executionContext: afm,
        drillContext: {
            type: VisualizationTypes.TABLE,
            element: getClickableElementNameByChartType(VisualizationTypes.TABLE),
            columnIndex,
            rowIndex,
            row,
            intersection: normalizeIntersectionElements(intersection)
        }
    };

    fireEvent(onFiredDrillEvent, data, target);
}
