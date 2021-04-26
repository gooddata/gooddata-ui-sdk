// (C) 2007-2021 GoodData Corporation
import debounce from "lodash/debounce";
import get from "lodash/get";
import cloneDeep from "lodash/cloneDeep";
import CustomEvent from "custom-event";
import invariant from "ts-invariant";
import {
    ChartElementType,
    ChartType,
    getVisualizationType,
    VisType,
    VisualizationTypes,
    IDrillConfig,
    IDrillEvent,
    IDrillEventContext,
    IDrillEventContextGroup,
    IDrillEventContextPoint,
    IDrillPoint,
    OnFiredDrillEvent,
} from "@gooddata/sdk-ui";
import Highcharts from "../../lib";
import { isBulletChart, isComboChart, isHeatmap, isTreemap } from "../_util/common";
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

function fireEvent(onDrill: OnFiredDrillEvent, data: any, target: EventTarget) {
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

const getElementChartType = (chartType: ChartType, point: IHighchartsPointObject): ChartType => {
    return get(point, "series.type", chartType);
};

const getDrillPointCustomProps = (
    point: IHighchartsPointObject,
    chartType: ChartType,
): Partial<IDrillPoint> => {
    if (isComboChart(chartType)) {
        return { type: get(point, "series.type") };
    }

    if (isBulletChart(chartType)) {
        return { type: get(point, "series.userOptions.bulletChartMeasureType") };
    }

    return {};
};

const getYValueForBulletChartTarget = (point: IHighchartsPointObject): number => {
    if (point.isNullTarget) {
        return null;
    }
    return point.target;
};

function composeDrillContextGroup(
    points: IHighchartsPointObject[],
    chartType: ChartType,
): IDrillEventContextGroup {
    const sanitizedPoints = sanitizeContextPoints(chartType, points);
    const contextPoints: IDrillPoint[] = sanitizedPoints.map((point: IHighchartsPointObject) => {
        const elementChartType = getElementChartType(chartType, point);
        const customProps = getDrillPointCustomProps(point, chartType);

        return {
            x: point.x,
            y: elementChartType === "bullet" ? getYValueForBulletChartTarget(point) : point.y,
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

function getClickableElementNameForBulletChart(point: any) {
    return point.series.userOptions.bulletChartMeasureType;
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

    const elementChartType = getElementChartType(chartType, point);
    const xyProp = isTreemap(chartType)
        ? {}
        : {
              x: point.x,
              y: elementChartType === "bullet" ? point.target : point.y,
          };

    const customProp: Partial<IDrillEventContextPoint> = isComboChart(chartType)
        ? {
              elementChartType,
          }
        : {};

    return {
        type: chartType,
        element: isBulletChart(chartType)
            ? getClickableElementNameForBulletChart(point)
            : getClickableElementNameByChartType(elementChartType),
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

        const data: IDrillEvent = {
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
): void {
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
        const contextPoints: IDrillPoint[] = sanitizedPoints.map((point: IHighchartsPointObject) => {
            const customProps = isBulletChart(chartType)
                ? { type: get(point, "series.userOptions.bulletChartMeasureType") }
                : {};

            return {
                x: point.x,
                y: point.y,
                intersection: cloneDeep(point.drillIntersection),
                ...customProps,
            };
        });
        const drillContext: IDrillEventContext = {
            type: chartType,
            element: "label",
            points: contextPoints,
        };
        const data: IDrillEvent = {
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
): void {
    tickLabelClickDebounce(drillConfig, points, target, chartType);
}
