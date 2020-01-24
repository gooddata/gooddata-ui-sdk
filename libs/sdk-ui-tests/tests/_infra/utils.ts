// (C) 2007-2019 GoodData Corporation

import omit = require("lodash/omit");
import { IChartConfig, ICoreChartProps, ICorePivotTableProps } from "@gooddata/sdk-ui";

const InsignificantCoreChartProps: Array<keyof ICoreChartProps> = ["execution"];
const InsignificantCorePivotProps: Array<keyof ICorePivotTableProps> = ["execution", "intl"];

const ConfigNotApplicableInInsight: Array<keyof IChartConfig> = [
    "colorPalette",
    "colors",
    "separators",
    "limits",
    "type",
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

/**
 * Transforms chart config to visualization properties as stored in insight. This is a simple transformation
 * that strips away those config props which are not applicable for plug viz.
 *
 * @param chartConfig - may be undefined
 */
export function chartConfigToVisProperties(chartConfig: IChartConfig = {}): any {
    /*
     * Indeed, the properties content is stored in 'properties' entry in insight AND the content itself
     * is wrapped in another object under 'properties' entry.
     *
     * For more see: getSupportedProperties in propertiesHelper.ts or the code that creates insight from
     * bear visualization object.
     *
     * TODO: remove this double wrap
     */
    return {
        properties: {
            controls: omit(chartConfig, ConfigNotApplicableInInsight),
        },
    };
}
