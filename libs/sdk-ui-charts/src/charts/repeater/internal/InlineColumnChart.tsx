// (C) 2023-2025 GoodData Corporation
import React from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { RepeaterInlineVisualizationDataPoint } from "./dataViewToRepeaterData.js";
import { IResultAttributeHeaderItem } from "@gooddata/sdk-model";
import { getTooltipHtml } from "./highcharts.js";

export const InlineColumnChart: React.FC<IInlineColumnChartOptions> = (props) => {
    const options = createOptions(props);
    return <HighchartsReact options={options} highcharts={Highcharts} />;
};

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
}: IInlineColumnChartOptions): Highcharts.Options {
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
