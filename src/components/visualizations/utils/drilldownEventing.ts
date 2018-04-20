// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import debounce = require('lodash/debounce');
import * as invariant from 'invariant';
import * as CustomEvent from 'custom-event';
import { AFM, Execution } from '@gooddata/typings';
import * as Highcharts from '@types/highcharts';
import { IDrillableItem, IDrillEventIntersectionElement } from '../../../interfaces/DrillEvents';
import { VisElementType, VisType, VisualizationTypes } from '../../../constants/visualizationTypes';

export interface IDrillableItemLocalId extends IDrillableItem {
    localIdentifier: AFM.Identifier;
}

export function isDrillableItemLocalId(item: IDrillableItem | IDrillableItemLocalId): item is IDrillableItemLocalId {
    return (item as IDrillableItemLocalId).localIdentifier !== undefined;
}

export interface IDrillIntersection {
    id: string;
    title: string;
    value: Execution.DataValue;
    name: string;
    uri: string;
    identifier: AFM.Identifier;
}

export interface IHighchartsPointObject extends Highcharts.PointObject {
    drillContext: IDrillIntersection[];
}

export interface IHighchartsChartDrilldownEvent extends Highcharts.ChartDrilldownEvent {
    point?: IHighchartsPointObject;
    points?: IHighchartsPointObject[];
}

export interface ICellDrillEvent {
    columnIndex: number;
    rowIndex: number;
    row: string[];
    intersection: IDrillIntersection[];
}

export type FiredDrillEventCallback = (data: any) => boolean;

export interface IDrillConfig {
    afm: AFM.IAfm;
    onFiredDrillEvent: FiredDrillEventCallback;
}

export function isGroupHighchartsDrillEvent(event: IHighchartsChartDrilldownEvent) {
    return !!event.points;
}

function getPoPMeasureIdentifier(measure: AFM.IMeasure): AFM.Identifier {
    return get<string>(measure, ['definition', 'popMeasure', 'measureIdentifier']);
}

function findMeasureByIdentifier(afm: AFM.IAfm, localIdentifier: AFM.Identifier) {
    return (afm.measures || []).find((m: AFM.IMeasure) => m.localIdentifier === localIdentifier);
}

export function getMeasureUriOrIdentifier(afm: AFM.IAfm, localIdentifier: AFM.Identifier): IDrillableItem {
    let measure = findMeasureByIdentifier(afm, localIdentifier);
    if (measure) {
        const popMeasureIdentifier = getPoPMeasureIdentifier(measure);
        if (popMeasureIdentifier) {
            measure = findMeasureByIdentifier(afm, popMeasureIdentifier);
        }
        return {
            uri: get<string>(measure, ['definition', 'measure', 'item', 'uri']),
            identifier: get<string>(measure, ['definition', 'measure', 'item', 'identifier'])
        };
    }
    return null;
}

function isHeaderDrillable(drillableItems: IDrillableItem[], header: IDrillableItem) {
    return drillableItems.some((drillableItem: IDrillableItem) =>
        // Check for defined values because undefined === undefined
        (drillableItem.identifier && header.identifier && drillableItem.identifier === header.identifier) ||
        (drillableItem.uri && header.uri && drillableItem.uri === header.uri)
    );
}

export function isDrillable(drillableItems: IDrillableItem[],
                            header: IDrillableItemLocalId | IDrillableItem,
                            afm: AFM.IAfm) {
    // This works only for non adhoc metric & attributes
    // because adhoc metrics don't have uri & identifier
    const isDrillablePureHeader = isHeaderDrillable(drillableItems, header);

    const afmHeader = isDrillableItemLocalId(header) ? getMeasureUriOrIdentifier(afm, header.localIdentifier) : null;
    const isDrillableAdhocHeader = afmHeader && isHeaderDrillable(drillableItems, afmHeader);

    return !!(isDrillablePureHeader || isDrillableAdhocHeader);
}

export function getClickableElementNameByChartType(type: VisType): VisElementType {
    switch (type) {
        case VisualizationTypes.LINE:
        case VisualizationTypes.AREA:
        case VisualizationTypes.SCATTER:
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
            return 'cell';
        default:
            invariant(false, `Unknown visualization type: ${type}`);
            return null;
    }
}

function fireEvent(onFiredDrillEvent: FiredDrillEventCallback, data: any, target: EventTarget) {
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

function normalizeIntersectionElements(intersection: IDrillIntersection[]): IDrillEventIntersectionElement[] {
    return intersection.map(({ id, title, value, name, uri, identifier }) => {
        return {
            id,
            title: title || value as string || name,
            header: {
                uri,
                identifier
            }
        };
    });
}

function composeDrillContextGroup({ points }: IHighchartsChartDrilldownEvent, chartType: VisType) {
    return {
        type: chartType,
        element: 'label',
        points: points.map((p: IHighchartsPointObject) => {
            return {
                x: p.x,
                y: p.y,
                intersection: normalizeIntersectionElements(p.drillContext)
            };
        })
    };
}

function composeDrillContextPoint({ point }: IHighchartsChartDrilldownEvent, chartType: VisType) {
    return {
        type: chartType,
        element: getClickableElementNameByChartType(chartType),
        x: point.x,
        y: point.y,
        intersection: normalizeIntersectionElements(point.drillContext)
    };
}

const chartClickDebounced = debounce((drillConfig: IDrillConfig, event: IHighchartsChartDrilldownEvent,
                                      target: EventTarget, chartType: VisType) => {
    const { afm, onFiredDrillEvent } = drillConfig;

    const data = {
        executionContext: afm,
        drillContext: isGroupHighchartsDrillEvent(event) ?
            composeDrillContextGroup(event, chartType) : composeDrillContextPoint(event, chartType)
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
    const data = {
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
