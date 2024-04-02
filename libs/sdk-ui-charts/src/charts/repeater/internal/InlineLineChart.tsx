// (C) 2023-2024 GoodData Corporation
import React from "react";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { RepeaterInlineVisualizationDataPoint } from "./dataViewToRepeaterData.js";
import { IResultAttributeHeaderItem } from "@gooddata/sdk-model";
import { getTooltipHtml } from "./highcharts.js";

export const InlineLineChart: React.FC<IInlineLineChartOptions> = ({
    data,
    height,
    headerItems,
    metricTitle,
    sliceTitle,
}) => {
    const options = createOptions({ height, data, headerItems, metricTitle, sliceTitle });
    return <HighchartsReact options={options} highcharts={Highcharts} />;
};

interface IInlineLineChartOptions {
    height: number;
    data: RepeaterInlineVisualizationDataPoint[];
    headerItems: IResultAttributeHeaderItem[];
    metricTitle: string;
    sliceTitle?: string;
}

function createOptions({
    height,
    data,
    headerItems,
    metricTitle,
    sliceTitle,
}: IInlineLineChartOptions): Highcharts.Options {
    return {
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
            margin: 0,
            spacing: [0, 0, 0, 0],
        },
        yAxis: {
            visible: false,
            minPadding: 0.001,
            maxPadding: 0.001,
        },
        xAxis: {
            visible: false,
            minPadding: 0.001,
            maxPadding: 0.001,
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
                return getTooltipHtml({ metricTitle, metricValue, sliceTitle, sliceValue });
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
                lineWidth: 2,
                type: "line",
                color: "#14B2E2",
                data: data.map((d) => d.value),
                states: {
                    hover: {
                        enabled: false,
                    },
                },
            },
        ],
    };
}
