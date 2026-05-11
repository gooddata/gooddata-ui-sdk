// (C) 2023-2026 GoodData Corporation

import { HighchartsReact } from "highcharts-react-official";
import Highcharts from "highcharts/esm/highcharts.js";

import { type IResultAttributeHeaderItem } from "@gooddata/sdk-model";

import { type HighchartsOptions } from "../../../highcharts/lib/index.js";

import { type RepeaterInlineVisualizationDataPoint } from "./dataViewToRepeaterData.js";
import { getTooltipHtml } from "./highcharts.js";

export function InlineColumnChart(props: IInlineColumnChartOptions) {
    const options = createOptions(props);
    return <HighchartsReact options={options} highcharts={Highcharts} />;
}

interface IInlineColumnChartOptions {
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
}: IInlineColumnChartOptions): HighchartsOptions {
    return {
        credits: {
            enabled: false,
        },
        accessibility: {
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
            margin: 1,
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
                type: "column",
                color,
                data: data.map((d) => d.value),
                states: {
                    hover: {
                        enabled: false,
                    },
                },
                borderRadius: 0,
            },
        ],
    };
}
