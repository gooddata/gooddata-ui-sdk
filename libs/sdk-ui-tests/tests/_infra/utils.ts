// (C) 2007-2019 GoodData Corporation

import omit = require("lodash/omit");
import { ICoreChartProps } from "@gooddata/sdk-ui";

const InsignificantCoreChartProps: Array<keyof ICoreChartProps> = ["execution"];

/**
 * Cleans up core chart properties before taking their snapshot. The goal of this function is to remove any properties
 * that are not significant for the snapshot testing.
 *
 * @param props - props to clean up
 */
export function cleanupCoreChartProps(props?: ICoreChartProps): any {
    if (!props) {
        return;
    }

    return omit(props, InsignificantCoreChartProps);
}
