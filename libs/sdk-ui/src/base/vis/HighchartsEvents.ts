// (C) 2025 GoodData Corporation

/**
 * @internal
 */
export const FOCUS_HIGHCHARTS_DATAPOINT_EVENT = "gd:chart:focusDatapoint";

/**
 * @internal
 */
export interface IFocusHighchartsDatapointEventDetail {
    chartId: string;
    seriesIndex: number;
    pointIndex: number;
}

/**
 * @internal
 */
export function createFocusHighchartsDatapointEvent(detail: IFocusHighchartsDatapointEventDetail) {
    return new CustomEvent<IFocusHighchartsDatapointEventDetail>(FOCUS_HIGHCHARTS_DATAPOINT_EVENT, {
        detail,
    });
}
