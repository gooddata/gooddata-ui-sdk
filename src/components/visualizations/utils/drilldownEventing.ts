// (C) 2007-2018 GoodData Corporation
import get = require('lodash/get');
import debounce = require('lodash/debounce');
import * as invariant from 'invariant';
import { VisualizationTypes } from '../../../constants/visualizationTypes';

// tslint:disable-next-line
const CustomEvent = require('custom-event');

function getPoPMeasureIdentifier(measure: any) {
    return get(measure, ['definition', 'popMeasure', 'measureIdentifier']);
}

function findMeasureByIdentifier(afm: any, localIdentifier: any) {
    return (afm.measures || []).find((m: any) => m.localIdentifier === localIdentifier);
}

export function getMeasureUriOrIdentifier(afm: any, localIdentifier: any) {
    let measure = findMeasureByIdentifier(afm, localIdentifier);
    if (measure) {
        const popMeasureIdentifier = getPoPMeasureIdentifier(measure);
        if (popMeasureIdentifier) {
            measure = findMeasureByIdentifier(afm, popMeasureIdentifier);
        }
        return {
            uri: get(measure, ['definition', 'measure', 'item', 'uri']),
            identifier: get(measure, ['definition', 'measure', 'item', 'identifier'])
        };
    }
    return null;
}

function isHeaderDrillable(drillableItems: any, header: any) {
    return drillableItems.some((drillableItem: any) =>
        // Check for defined values because undefined === undefined
        (drillableItem.identifier && header.identifier && drillableItem.identifier === header.identifier) ||
        (drillableItem.uri && header.uri && drillableItem.uri === header.uri)
    );
}

export function isDrillable(drillableItems: any, header: any, afm: any) {
    // This works only for non adhoc metric & attributes
    // because adhoc metrics don't have uri & identifier
    const isDrillablePureHeader = isHeaderDrillable(drillableItems, header);

    const afmHeader = getMeasureUriOrIdentifier(afm, header.localIdentifier);
    const isDrillableAdhocHeader = afmHeader && isHeaderDrillable(drillableItems, afmHeader);

    return !!(isDrillablePureHeader || isDrillableAdhocHeader);
}

export function getClickableElementNameByChartType(type: any) {
    switch (type) {
        case VisualizationTypes.LINE:
        case VisualizationTypes.AREA:
            return 'point';
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BAR:
            return 'bar';
        case VisualizationTypes.PIE:
            return 'slice';
        case VisualizationTypes.TABLE:
            return 'cell';
        default:
            return invariant(false, `Unknown visualization type: ${type}`);
    }
}

function fireEvent(onFiredDrillEvent: any, data: any, target: any) {
    const returnValue = onFiredDrillEvent(data);

    // if user-specified onFiredDrillEvent fn returns false, do not fire default DOM event
    if (returnValue !== false) {
        target.dispatchEvent(new CustomEvent('drill', {
            detail: data,
            bubbles: true
        }));
    }
}

function normalizeIntersectionElements(intersection: any) {
    return intersection.map(({ id, title, value, name, uri, identifier }: any) => {
        return {
            id,
            title: title || value || name,
            header: {
                uri,
                identifier
            }
        };
    });
}

function composeDrillContextGroup({ points }: any, chartType: any) {
    return {
        type: chartType,
        element: 'label',
        points: points.map((p: any) => {
            return {
                x: p.x,
                y: p.y,
                intersection: normalizeIntersectionElements(p.drillContext)
            };
        })
    };
}

function composeDrillContextPoint({ point }: any, chartType: any) {
    return {
        type: chartType,
        element: getClickableElementNameByChartType(chartType),
        x: point.x,
        y: point.y,
        intersection: normalizeIntersectionElements(point.drillContext)
    };
}

const chartClickDebounced = debounce((drillConfig: any, event: any, target: any, chartType: any) => {
    const { afm, onFiredDrillEvent } = drillConfig;
    const { points } = event;
    const isGroupClick = !!points;

    const data = {
        executionContext: afm,
        drillContext: isGroupClick ?
            composeDrillContextGroup(event, chartType) : composeDrillContextPoint(event, chartType)
    };

    fireEvent(onFiredDrillEvent, data, target);
});

export const chartClick: any = chartClickDebounced;

export const cellClick = (drillConfig: any, event: any, target: any) => {
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
};
