// (C) 2007-2019 GoodData Corporation
import debounce = require("lodash/debounce");
import get = require("lodash/get");
import * as CustomEvent from "custom-event";
import * as invariant from "invariant";
import {
    ChartElementType,
    ChartType,
    VisType,
    VisualizationTypes,
} from "../../base/constants/visualizationTypes";
import { getVisualizationType } from "../../base/helpers/visualizationType";
import {
    IDrillConfig,
    IDrillEvent2,
    IDrillEventContext,
    IDrillEventContextGroup,
    IDrillEventContextPoint,
    IDrillPoint,
} from "../../base/interfaces/DrillEvents";
import { OnFiredDrillEvent2 } from "../../base/interfaces/Events";
import Highcharts from "../chart/highcharts/highchartsEntryPoint";
import { isComboChart, isHeatmap, isTreemap } from "./common";
import { IHighchartsPointObject, isGroupHighchartsDrillEvent } from "./isGroupHighchartsDrillEvent";

export function getClickableElementNameByChartType(type: VisType): ChartElementType {
    switch (type) {
        case VisualizationTypes.LINE:
        case VisualizationTypes.AREA:
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.BUBBLE:
            return "point";
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BAR:
            return "bar";
        case VisualizationTypes.PIE:
        case VisualizationTypes.TREEMAP:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
            return "slice";
        case VisualizationTypes.HEATMAP:
            return "cell";
        default:
            invariant(false, `Unknown visualization type: ${type}`);
            return null;
    }
}

function fireEvent(onDrill: OnFiredDrillEvent2, data: any, target: EventTarget) {
    const returnValue = onDrill(data);

    // if user-specified onDrill fn returns false, do not fire default DOM event
    if (returnValue !== false) {
        const event = new CustomEvent("drill", {
            detail: data,
            bubbles: true,
        });
        target.dispatchEvent(event);
    }
}

function composeDrillContextGroup(
    points: IHighchartsPointObject[],
    chartType: ChartType,
): IDrillEventContextGroup {
    const sanitizedPoints = sanitizeContextPoints(chartType, points);
    const contextPoints: IDrillPoint[] = sanitizedPoints.map((point: IHighchartsPointObject) => {
        const customProps: Partial<IDrillPoint> = isComboChart(chartType)
            ? { type: get(point, "series.type") }
            : {};

        return {
            x: point.x,
            y: point.y,
            intersection: point.drillIntersection,
            ...customProps,
        };
    });

    return {
        type: chartType,
        element: "label",
        points: contextPoints,
    };
}

function composeDrillContextPoint(
    point: IHighchartsPointObject,
    chartType: ChartType,
): IDrillEventContextPoint {
    const zProp = isNaN(point.z) ? {} : { z: point.z };
    const valueProp =
        isTreemap(chartType) || isHeatmap(chartType)
            ? {
                  value: point.value ? point.value.toString() : "",
              }
            : {};
    const xyProp = isTreemap(chartType)
        ? {}
        : {
              x: point.x,
              y: point.y,
          };

    const elementChartType: ChartType = get(point, "series.type", chartType);
    const customProp: Partial<IDrillEventContextPoint> = isComboChart(chartType)
        ? {
              elementChartType,
          }
        : {};

    return {
        type: chartType,
        element: getClickableElementNameByChartType(elementChartType),
        intersection: point.drillIntersection,
        ...xyProp,
        ...zProp,
        ...valueProp,
        ...customProp,
    };
}

const chartClickDebounced = debounce(
    (
        drillConfig: IDrillConfig,
        event: Highcharts.DrilldownEventObject,
        target: EventTarget,
        chartType: ChartType,
    ) => {
        const { dataView, onDrill } = drillConfig;
        const type = getVisualizationType(chartType);
        let drillContext: IDrillEventContext;

        if (isGroupHighchartsDrillEvent(event)) {
            const points = event.points as IHighchartsPointObject[];
            drillContext = composeDrillContextGroup(points, type);
        } else {
            const point: IHighchartsPointObject = event.point as IHighchartsPointObject;
            drillContext = composeDrillContextPoint(point, type);
        }

        const data: IDrillEvent2 = {
            dataView,
            drillContext,
        };

        fireEvent(onDrill, data, target);
    },
);

export function chartClick(
    drillConfig: IDrillConfig,
    event: Highcharts.DrilldownEventObject,
    target: EventTarget,
    chartType: ChartType,
) {
    chartClickDebounced(drillConfig, event, target, chartType);
}

const tickLabelClickDebounce = debounce(
    (
        drillConfig: IDrillConfig,
        points: IHighchartsPointObject[],
        target: EventTarget,
        chartType: ChartType,
    ): void => {
        const { dataView, onDrill } = drillConfig;
        const sanitizedPoints = sanitizeContextPoints(chartType, points);
        const contextPoints: IDrillPoint[] = sanitizedPoints.map((point: IHighchartsPointObject) => ({
            x: point.x,
            y: point.y,
            intersection: point.drillIntersection,
        }));
        const drillContext: IDrillEventContext = {
            type: chartType,
            element: "label",
            points: contextPoints,
        };
        const data: IDrillEvent2 = {
            dataView,
            drillContext,
        };

        fireEvent(onDrill, data, target);
    },
);

function sanitizeContextPoints(
    chartType: ChartType,
    points: IHighchartsPointObject[],
): IHighchartsPointObject[] {
    if (isHeatmap(chartType)) {
        return points.filter((point: IHighchartsPointObject) => !point.ignoredInDrillEventContext);
    }
    return points;
}

export function tickLabelClick(
    drillConfig: IDrillConfig,
    points: IHighchartsPointObject[],
    target: EventTarget,
    chartType: ChartType,
) {
    tickLabelClickDebounce(drillConfig, points, target, chartType);
}
