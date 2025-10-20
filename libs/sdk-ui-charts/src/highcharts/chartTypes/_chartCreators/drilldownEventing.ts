// (C) 2007-2025 GoodData Corporation

import { cloneDeep, debounce } from "lodash-es";
import { invariant } from "ts-invariant";

import {
    ChartElementType,
    ChartType,
    IDrillConfig,
    IDrillEvent,
    IDrillEventContext,
    IDrillEventContextGroup,
    IDrillEventContextPoint,
    IDrillPoint,
    OnFiredDrillEvent,
    VisType,
    VisualizationTypes,
    getVisualizationType,
} from "@gooddata/sdk-ui";

import { IHighchartsPointObject, isGroupHighchartsDrillEvent } from "./isGroupHighchartsDrillEvent.js";
import { DrilldownEventObject } from "../../lib/index.js";
import { isBulletChart, isComboChart, isHeatmap, isTreemap } from "../_util/common.js";

export function getClickableElementNameByChartType(type: VisType): ChartElementType {
    switch (type) {
        case VisualizationTypes.LINE:
        case VisualizationTypes.AREA:
        case VisualizationTypes.SCATTER:
        case VisualizationTypes.BUBBLE:
            return "point";
        case VisualizationTypes.COLUMN:
        case VisualizationTypes.BAR:
        case VisualizationTypes.WATERFALL:
            return "bar";
        case VisualizationTypes.PIE:
        case VisualizationTypes.TREEMAP:
        case VisualizationTypes.DONUT:
        case VisualizationTypes.FUNNEL:
        case VisualizationTypes.PYRAMID:
        case VisualizationTypes.DEPENDENCY_WHEEL:
        case VisualizationTypes.SANKEY:
            return "slice";
        case VisualizationTypes.HEATMAP:
            return "cell";
        default:
            invariant(false, `Unknown visualization type: ${type}`);
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
    return (point?.series?.type as ChartType) ?? chartType;
};

const getDrillPointCustomProps = (
    point: IHighchartsPointObject,
    chartType: ChartType,
): Partial<IDrillPoint> => {
    if (isComboChart(chartType)) {
        return { type: point?.series?.type as ChartType };
    }

    if (isBulletChart(chartType)) {
        return { type: (point?.series?.userOptions as any)?.bulletChartMeasureType };
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
    const contextPoints: IDrillPoint[] = points.map((point: IHighchartsPointObject) => {
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
        seriesIndex: point.series.index,
        pointIndex: point.index,
        ...xyProp,
        ...zProp,
        ...valueProp,
        ...customProp,
    };
}

const chartClickDebounced = debounce(
    (
        drillConfig: IDrillConfig,
        event: DrilldownEventObject,
        target: EventTarget,
        chartId: string,
        chartType: ChartType,
    ) => {
        const { dataView, onDrill } = drillConfig;
        const type = getVisualizationType(chartType);
        let drillContext: IDrillEventContext;

        if (isGroupHighchartsDrillEvent(event)) {
            const points = event.points as IHighchartsPointObject[];
            drillContext = composeDrillContextGroup(points, type);
            // Reset points state to remove focus border
            points.forEach((point) => {
                if (point && typeof point.setState === "function") {
                    point.setState("");
                }
            });
        } else {
            const point: IHighchartsPointObject = event.point as IHighchartsPointObject;
            drillContext = composeDrillContextPoint(point, type);
            // Reset point state to remove focus border
            if (point && typeof point.setState === "function") {
                point.setState("");
            }
        }

        drillContext.chartId = chartId;

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
    chartId: string,
    chartType: ChartType,
): void {
    chartClickDebounced(drillConfig, event, target, chartId, chartType);
}

const tickLabelClickDebounce = debounce(
    (
        drillConfig: IDrillConfig,
        points: IHighchartsPointObject[],
        target: EventTarget,
        chartId: string,
        chartType: ChartType,
    ): void => {
        const { dataView, onDrill } = drillConfig;
        const contextPoints: IDrillPoint[] = points.map((point: IHighchartsPointObject) => {
            const customProps = isBulletChart(chartType)
                ? { type: (point?.series?.userOptions as any)?.bulletChartMeasureType }
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
        drillContext.chartId = chartId;

        const data: IDrillEvent = {
            dataView,
            drillContext,
        };

        fireEvent(onDrill, data, target);
    },
);

export function tickLabelClick(
    drillConfig: IDrillConfig,
    points: IHighchartsPointObject[],
    target: EventTarget,
    chartId: string,
    chartType: ChartType,
): void {
    tickLabelClickDebounce(drillConfig, points, target, chartId, chartType);
}
