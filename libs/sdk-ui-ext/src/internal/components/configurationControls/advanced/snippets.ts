// (C) 2024 GoodData Corporation

export interface IChartConfigurationSnippetBase {
    type: "header" | "item";
    id: string;
    name: string;
}

export interface IChartConfigurationHeaderSnippet extends IChartConfigurationSnippetBase {
    type: "header";
}

export interface IChartConfigurationItemSnippet extends IChartConfigurationSnippetBase {
    type: "item";
    value: Record<string, unknown>; // JSON value
    description: string;
}

export type IChartConfigurationSnippet = IChartConfigurationHeaderSnippet | IChartConfigurationItemSnippet;

// The snippets are not translated in the first milestone which is for internal use only
export const SNIPPETS: IChartConfigurationSnippet[] = [
    {
        type: "header",
        id: "yAxis",
        name: "Y-Axis",
    },
    {
        name: "Crosshair",
        id: "crosshair",
        description:
            "A crosshair is a line or multiple lines that extend across the chart to help users better identify values on both the x and y axes.",
        value: {
            yAxis: [
                {
                    crosshair: {
                        width: 1,
                        color: "#C9D5E0",
                    },
                },
            ],
        },
        type: "item",
    },
    {
        name: "Logarithmic scale",
        id: "logarithmicScale",
        description:
            "The logarithmic scale is used to plot data that spans multiple orders of magnitude, allowing for better visualization of data that grows exponentially.",
        value: {
            yAxis: [
                {
                    type: "logarithmic",
                },
            ],
        },
        type: "item",
    },
    {
        name: "Grid stripes",
        id: "gridStripes",
        description:
            "Grid stripes are alternating bands of color that run across the chart background, making it easier to visually follow data points and identify trends.",
        value: {
            yAxis: [
                {
                    alternateGridColor: "#F5F8FA",
                },
            ],
        },
        type: "item",
    },
    {
        name: "Minor grid line",
        id: "minorGridLine",
        description:
            "Minor grid lines are additional, finer lines drawn between the major grid lines, helping users read smaller increments on the axis.",
        value: {
            yAxis: [
                {
                    minorGridLineColor: "#EBEBEB",
                    minorTickInterval: "auto",
                    minorGridLineDashStyle: "longdash",
                },
            ],
        },
        type: "item",
    },
    {
        name: "Reference line",
        id: "referenceLine",
        description:
            "A reference line is a line added at a specific value along an axis, providing an important reference point. It could represent a target or a threshold, helping viewers interpret the data in relation to a key benchmark.",
        value: {
            yAxis: [
                {
                    plotLines: [
                        {
                            color: "#00C18D",
                            width: 2,
                            value: 11_000,
                        },
                    ],
                },
            ],
        },
        type: "item",
    },
    {
        name: "Reference band",
        id: "referenceBand",
        description:
            "A reference band is a colored area added between two defined values on an axis. It is useful for emphasizing a particular range of values, such as acceptable or critical limits, and helps in highlighting areas of interest within the chart.",
        value: {
            yAxis: [
                {
                    plotBands: [
                        {
                            from: 18000,
                            to: 22000,
                            color: "rgba(0, 193, 141, 0.2)",
                            borderWidth: 2,
                            borderColor: "rgba(0, 193, 141, 0.2)",
                        },
                    ],
                },
            ],
        },
        type: "item",
    },
    {
        type: "header",
        id: "style",
        name: "Style",
    },
    {
        name: "Line width",
        id: "lineWidth",
        description: "Line width refers to the thickness of the data lines used in the visualization.",
        value: {
            plotOptions: {
                series: {
                    lineWidth: 1,
                },
            },
        },
        type: "item",
    },
    {
        name: "Data point marker",
        id: "dataPointMarker",
        description:
            "Data point markers are symbols used to mark each individual data point in a series, such as circles, squares, or other shapes",
        value: {
            plotOptions: {
                line: {
                    marker: {
                        radius: 6,
                        lineWidth: 2,
                        symbol: "square",
                    },
                },
            },
        },
        type: "item",
    },
    {
        name: "Smooth line",
        id: "smoothLine",
        description:
            "A smooth line is a type of line that curves between data points, rather than using sharp, angular segments",
        value: {
            chart: {
                type: "spline",
            },
        },
        type: "item",
    },
    {
        name: "Stepped line",
        id: "steppedLine",
        description:
            "A stepped line connects data points using horizontal and vertical segments, rather than a direct diagonal line. It is useful for showing changes that occur in discrete steps.",
        value: {
            plotOptions: {
                line: {
                    step: "left",
                },
            },
        },
        type: "item",
    },
    {
        name: "Negative value color",
        id: "negativeValueColor",
        description:
            "Negative value color is a feature that allows different colors to be used for data points with negative values.",
        value: {
            plotOptions: {
                series: {
                    negativeColor: "#E54D40",
                },
            },
        },
        type: "item",
    },
    {
        name: "Inner size",
        id: "innerSize",
        description: "Inner size",
        value: {
            plotOptions: {
                pie: {
                    innerSize: "90%",
                },
            },
        },
        type: "item",
    },
];
