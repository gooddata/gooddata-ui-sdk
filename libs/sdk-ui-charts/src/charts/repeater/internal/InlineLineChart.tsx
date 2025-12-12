// (C) 2023-2025 GoodData Corporation

import Highcharts from "highcharts/esm/highcharts.js";
import { HighchartsReact } from "highcharts-react-official";

import { type IResultAttributeHeaderItem } from "@gooddata/sdk-model";

import { type RepeaterInlineVisualizationDataPoint } from "./dataViewToRepeaterData.js";
import { getTooltipHtml } from "./highcharts.js";
import { type HighchartsOptions } from "../../../highcharts/lib/index.js";

export function InlineLineChart(props: IInlineLineChartOptions) {
    const options = createOptions(props);
    return <HighchartsReact options={options} highcharts={Highcharts} />;
}

interface IInlineLineChartOptions {
    height: number;
    data: RepeaterInlineVisualizationDataPoint[];
    headerItems: IResultAttributeHeaderItem[];
    metricTitle: string;
    sliceTitle?: string;
    color?: string;
}

function createOptions({
    height,
    data,
    headerItems,
    metricTitle,
    sliceTitle,
    color,
}: IInlineLineChartOptions): HighchartsOptions {
    return {
        accessibility: {
            enabled: false,
        },
        credits: {
            enabled: false,
        },
        title: {
            text: undefined,
            style: {
                height: 0,
                width: 0,
            },
        },
        chart: {
            backgroundColor: "transparent",
            height,
            margin: 5,
        },
        yAxis: {
            visible: false,
        },
        xAxis: {
            visible: false,
        },
        legend: {
            enabled: false,
        },
        tooltip: {
            shared: true,
            outside: true,
            useHTML: true,
            formatter: function () {
                const sliceValue = headerItems[this.x]?.name;
                const metricValue = data[this.x]?.formattedValue;
                return getTooltipHtml({
                    metricTitle,
                    metricValue,
                    sliceTitle,
                    sliceValue,
                    pointColor: color,
                });
            },
        },
        plotOptions: {
            series: {
                states: {
                    inactive: {
                        opacity: 1,
                    },
                },
            },
        },
        series: [
            {
                lineWidth: height > 30 ? 2 : 1,
                type: "line",
                color,
                data: data.map((d) => d.value),
                states: {
                    hover: {
                        enabled: false,
                    },
                },
                marker: {
                    radius: height > 30 ? 3 : 2,
                },
            },
        ],
    };
}
