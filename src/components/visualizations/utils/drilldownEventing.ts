// (C) 2007-2018 GoodData Corporation
import get = require("lodash/get");
import debounce = require("lodash/debounce");
import * as CustomEvent from "custom-event";
import * as invariant from "invariant";
import {
    ChartElementType,
    ChartType,
    VisType,
    VisualizationTypes,
} from "../../../constants/visualizationTypes";
import {
    IDrillEvent,
    IDrillEventContextGroup,
    IDrillEventIntersectionElement,
    IDrillEventContextTable,
    IDrillPoint,
    IHighchartsChartDrilldownEvent,
    IHighchartsPointObject,
    IDrillConfig,
    ICellDrillEvent,
    isGroupHighchartsDrillEvent,
} from "../../../interfaces/DrillEvents";
import { OnFiredDrillEvent } from "../../../interfaces/Events";
import { isComboChart, isHeatmap, isTreemap } from "./common";

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

function fireEvent(onFiredDrillEvent: OnFiredDrillEvent, data: any, target: EventTarget) {
    const returnValue = onFiredDrillEvent(data);

    // if user-specified onFiredDrillEvent fn returns false, do not fire default DOM event
    if (returnValue !== false) {
        const event = new CustomEvent("drill", {
            detail: data,
            bubbles: true,
        });
        target.dispatchEvent(event);
    }
}

function composeDrillContextGroup(
    { points }: IHighchartsChartDrilldownEvent,
    chartType: ChartType,
): IDrillEventContextGroup {
    const contextPoints: IDrillPoint[] = points.map((point: IHighchartsPointObject) => {
        return {
            x: point.x,
            y: point.y,
            intersection: point.drillIntersection,
        };
    });
    return {
        type: chartType,
        element: "label",
        points: contextPoints,
    };
}

function composeDrillContextPoint({ point }: IHighchartsChartDrilldownEvent, chartType: ChartType) {
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
    return {
        type: chartType,
        element: getClickableElementNameByChartType(chartType),
        intersection: point.drillIntersection,
        ...xyProp,
        ...zProp,
        ...valueProp,
    };
}

const chartClickDebounced = debounce(
    (
        drillConfig: IDrillConfig,
        event: IHighchartsChartDrilldownEvent,
        target: EventTarget,
        chartType: ChartType,
    ) => {
        const { afm, onFiredDrillEvent } = drillConfig;

        let usedChartType = chartType;
        if (isComboChart(chartType)) {
            usedChartType = get(event, ["point", "series", "options", "type"], chartType);
        }

        const drillContext = isGroupHighchartsDrillEvent(event)
            ? composeDrillContextGroup(event, usedChartType)
            : composeDrillContextPoint(event, usedChartType);

        const data = {
            executionContext: afm,
            drillContext,
        };

        fireEvent(onFiredDrillEvent, data, target);
    },
);

export function chartClick(
    drillConfig: IDrillConfig,
    event: IHighchartsChartDrilldownEvent,
    target: EventTarget,
    chartType: ChartType,
) {
    chartClickDebounced(drillConfig, event, target, chartType);
}

export function cellClick(drillConfig: IDrillConfig, event: ICellDrillEvent, target: EventTarget) {
    const { afm, onFiredDrillEvent } = drillConfig;
    const { columnIndex, rowIndex, row, intersection } = event;

    const drillContext: IDrillEventContextTable = {
        type: VisualizationTypes.TABLE,
        element: "cell",
        columnIndex,
        rowIndex,
        row,
        intersection,
    };
    const data: IDrillEvent = {
        executionContext: afm,
        drillContext,
    };

    fireEvent(onFiredDrillEvent, data, target);
}

export function createDrillIntersectionElement(
    id: string,
    title: string,
    uri?: string,
    identifier?: string,
): IDrillEventIntersectionElement {
    const element: IDrillEventIntersectionElement = {
        id: id || "",
        title: title || "",
    };

    if (uri || identifier) {
        element.header = {
            uri: uri || "",
            identifier: identifier || "",
        };
    }

    return element;
}
