// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import identity = require("lodash/identity");
import cloneDeep = require("lodash/cloneDeep");

import ChartTransformation from "../../src/components/visualizations/chart/ChartTransformation";
import { VIEW_BY_DIMENSION_INDEX } from "../../src/components/visualizations/chart/constants";
import { BASE_DUAL_AXIS_CHARTS } from "../data/dualAxis";

import * as fixtures from "../test_data/fixtures";

import { wrap } from "../utils/wrap";

import "../../styles/scss/charts.scss";

storiesOf("Internal/HighCharts/ChartProperties", module)
    .add("Column chart without gridline", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[VIEW_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        grid: {
                            enabled: false,
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Column chart with label rotation", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[VIEW_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        xaxis: {
                            rotation: "60",
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Column chart with min and max Y axis", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[VIEW_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        yaxis: {
                            min: "500000",
                            max: "1000000",
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Column chart without X and Y axis", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[VIEW_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        xaxis: {
                            visible: false,
                        },
                        yaxis: {
                            visible: false,
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Dual axes chart with hiding right Y axis", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            visible: false,
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                />,
            ),
        );
    })
    .add("Dual axes chart, right Y axis with text rotation", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            rotation: "45",
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Dual axes chart, right Y axis without label", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            labelsEnabled: false,
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Dual axes chart, both axes with % format", () => {
        const dataSet = cloneDeep(fixtures.barChartWith3MetricsAndViewByAttribute);

        const measureItems = dataSet.executionResponse.dimensions[0].headers[0].measureGroupHeader.items;
        measureItems.forEach((item: any) => {
            item.measureHeaderItem.format += "%";
        });

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Dual axes chart, right Y axis with % format", () => {
        const dataSet = cloneDeep(fixtures.barChartWith3MetricsAndViewByAttribute);

        const measureItems = dataSet.executionResponse.dimensions[0].headers[0].measureGroupHeader.items;
        measureItems[2].measureHeaderItem.format += "%";

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "vertical",
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            measures: ["expectedMetric"],
                        },
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Dual axes chart with data labels enabled", () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;
        return screenshotWrap(
            <div>
                {BASE_DUAL_AXIS_CHARTS.map(type =>
                    wrap(
                        <ChartTransformation
                            config={{
                                type,
                                legend: {
                                    enabled: true,
                                    position: "top",
                                },
                                legendLayout: "vertical",
                                colorPalette: fixtures.customPalette,
                                secondary_yaxis: {
                                    measures: ["expectedMetric"],
                                },
                                dataLabels: {
                                    visible: type !== "bar", // disable data label on bar chart to make test stable
                                },
                            }}
                            {...dataSet}
                        />,
                    ),
                )}
            </div>,
        );
    });
