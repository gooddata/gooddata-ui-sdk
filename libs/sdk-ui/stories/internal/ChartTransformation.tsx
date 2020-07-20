// (C) 2007-2019 GoodData Corporation
import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screenshotWrap } from "@gooddata/test-storybook";

import { ChartTransformation, FLUID_LEGEND_THRESHOLD } from "../../src/highcharts";
import { immutableSet } from "../../src/highcharts/utils/common";
import { STACK_BY_DIMENSION_INDEX, VIEW_BY_DIMENSION_INDEX } from "../../src/highcharts/constants/dimensions";

import fixtureDataSets, * as fixtures from "../test_data/fixtures";

import { wrap } from "../utils/wrap";
import CustomLegend from "../utils/CustomLegend";

import "../../../sdk-ui-charts/styles/scss/charts.scss";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import identity from "lodash/identity";

storiesOf("Internal/HighCharts/ChartTransformation", module)
    .add("Column chart with 18 measures and view by attribute", () => {
        const dataSet = fixtures.barChartWith18MetricsAndViewByAttribute;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX].headers[0]
                                    .measureGroupHeader.items[1].measureHeaderItem.uri,
                        },
                    ]}
                    config={{
                        type: "column",
                        legend: {
                            enabled: true,
                            position: "top",
                        },
                        legendLayout: "horizontal",
                        colorPalette: fixtures.customPalette,
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })

    .add("Column chart with 6 pop measures and view by attribute", () => {
        const dataSet = fixtures.barChartWith6PopMeasuresAndViewByAttribute;

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
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })
    .add("Column chart with 6 previous period measures", () => {
        const dataSet = fixtures.barChartWith6PreviousPeriodMeasures;

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
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />,
            ),
        );
    })

    .add("Legend right with paging", () =>
        screenshotWrap(
            getChart({
                legendPosition: "right",
                dataSet: fixtures.barChartWith60MetricsAndViewByAttribute,
            }),
        ),
    )
    .add("Legend with mobile paging", () => (
        <div>
            Resize window to {FLUID_LEGEND_THRESHOLD}px or less
            {screenshotWrap(
                getChart({
                    legendPosition: "right",
                    legendResponsive: true,
                    dataSet: fixtures.barChartWith60MetricsAndViewByAttribute,
                    width: "100%",
                    height: "100%",
                    minHeight: 300,
                    chartHeight: 300,
                }),
            )}
        </div>
    ))
    .add("Responsive width", () =>
        screenshotWrap([
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendPosition: "top",
                width: "100%",
                key: "top",
            }),
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendPosition: "bottom",
                width: "100%",
                key: "bottom",
            }),
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendPosition: "left",
                width: "100%",
                key: "left",
            }),
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendPosition: "right",
                width: "100%",
                key: "right",
            }),
        ]),
    )
    .add("Fill parent without legend", () =>
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendEnabled: false,
                height: 500,
                width: "100%",
            }),
        ),
    )
    .add("Negative and zero values", () =>
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWithNegativeAndZeroValues,
                height: 500,
                width: "100%",
            }),
        ),
    )

    .add("Dual axes with mobile paging legend", () => (
        <div>
            Resize window to {FLUID_LEGEND_THRESHOLD}px or less
            {screenshotWrap(
                getChart({
                    legendPosition: "right",
                    legendResponsive: true,
                    dataSet: fixtures.chartWith20MetricsAndViewByAttribute,
                    width: "100%",
                    height: "100%",
                    minHeight: 300,
                    chartHeight: 300,
                    secondary_yaxis: {
                        measures: fixtures.metricsInSecondaryAxis,
                    },
                }),
            )}
        </div>
    ))
    .add("Over height bottom legend", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(1)}>
                {getChart({
                    legendPosition: "bottom",
                    dataSet: fixtures.barChartWith150MetricsAndViewByAttribute,
                })}
            </ScreenshotReadyWrapper>,
        ),
    );
