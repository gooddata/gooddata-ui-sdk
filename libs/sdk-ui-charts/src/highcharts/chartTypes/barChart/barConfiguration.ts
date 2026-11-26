// (C) 2007-2026 GoodData Corporation

import { _cloneDeep } from "@gooddata/util";

import { type IChartConfig } from "../../../interfaces/chartConfig.js";
import { type HighchartsOptions } from "../../lib/index.js";
import { MAX_POINT_WIDTH } from "../_chartCreators/commonConfiguration.js";
import { getCommonResponsiveConfig } from "../_chartCreators/responsive.js";
import { getAxesCounts } from "../_util/common.js";

const BAR_TEMPLATE: HighchartsOptions = {
    chart: {
        type: "bar",
    },
    accessibility: {
        keyboardNavigation: {
            seriesNavigation: {
                // Bar charts are inverted, so Highcharts swaps the arrow keys: Up/Down move between
                // points and Left/Right between series. Serialize the points so that every arrow key
                // walks through them (Right/Down next, Left/Up previous) and moves on into the next
                // series after the last point of a series. PageUp/PageDown still jump between series.
                mode: "serialize",
            },
        },
    },
    plotOptions: {
        bar: {
            maxPointWidth: MAX_POINT_WIDTH,
            dataLabels: {
                enabled: true,
                padding: 2,
            },
        },
        series: {
            states: {
                hover: {
                    enabled: false,
                },
            },
        },
    },
    xAxis: [],
    yAxis: [
        {
            labels: {
                distance: 7,
            },
            stackLabels: {
                enabled: false,
            },
        },
    ],
};

export function getBarConfiguration(config: IChartConfig): HighchartsOptions {
    const barConfiguration = _cloneDeep(BAR_TEMPLATE);

    if (config?.enableCompactSize && !config?.zoomInsight) {
        const reversed = true;
        const [xAxesCount, yAxesCount] = getAxesCounts(config);
        return {
            ...barConfiguration,
            responsive: getCommonResponsiveConfig(reversed, xAxesCount, yAxesCount),
        };
    }

    return barConfiguration;
}
