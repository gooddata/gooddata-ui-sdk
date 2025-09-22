// (C) 2007-2025 GoodData Corporation

import { omit } from "lodash-es";

import { ICoreChartProps } from "@gooddata/sdk-ui-charts";
import { IGeoChartInnerProps } from "@gooddata/sdk-ui-geo";
import { ICorePivotTableProps } from "@gooddata/sdk-ui-pivot";

const InsignificantCoreChartProps: Array<keyof ICoreChartProps> = ["execution", "onError"];
const InsignificantCorePivotProps: Array<keyof ICorePivotTableProps> = ["execution", "intl", "onError"];
const InsignificantCoreGeoProps: Array<keyof IGeoChartInnerProps> = [
    "execution",
    "dataView",
    "intl",
    "onError",
];

/**
 * Cleans up core chart properties before taking their snapshot. The goal of this function is to remove any properties
 * that are not significant for the snapshot testing.
 *
 * @param props - props to clean up
 */
export function cleanupCoreChartProps(props?: any): any {
    if (!props) {
        return;
    }

    return omit(props, InsignificantCoreChartProps);
}

/**
 * Cleans up core pivot properties before taking their snapshot. The goal of this function is to remove any properties
 * that are not significant for the snapshot testing.
 *
 * @param props - props to clean up
 */
export function cleanupCorePivotTableProps(props?: any): any {
    if (!props) {
        return;
    }

    return omit(props, InsignificantCorePivotProps);
}

export function cleanupGeoChartProps(props?: any): any {
    if (!props) {
        return;
    }

    return omit(props, InsignificantCoreGeoProps);
}
