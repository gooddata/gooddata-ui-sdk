// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import { storiesOf } from "@storybook/react";
import { action, decorateAction } from "@storybook/addon-actions";
import { screenshotWrap } from "@gooddata/test-storybook";
import { Execution } from "@gooddata/typings";

import { Visualization } from "../../src/components/visualizations/Visualization";
import * as headerPredicateFactory from "../../src/factory/HeaderPredicateFactory";
import { wrap } from "../utils/wrap";
import * as fixtures from "../test_data/fixtures";
import {
    VIEW_BY_DIMENSION_INDEX,
    STACK_BY_DIMENSION_INDEX,
} from "../../src/components/visualizations/chart/constants";

import "../../styles/scss/charts.scss";
import "../../styles/scss/table.scss";
import {
    EXECUTION_REQUEST_POP,
    EXECUTION_RESPONSE_POP,
    EXECUTION_RESULT_POP,
    TABLE_HEADERS_POP,
} from "../../src/components/visualizations/table/fixtures/periodOverPeriod";
import {
    EXECUTION_REQUEST_AM,
    EXECUTION_RESPONSE_AM,
    EXECUTION_RESULT_AM,
    TABLE_HEADERS_AM,
} from "../../src/components/visualizations/table/fixtures/arithmericMeasures";
import { PivotTable } from "../../src";
import { ATTRIBUTE_1, MEASURE_1, MEASURE_2, MEASURE_AM_1_2 } from "../data/componentProps";
import HeadlineTransformation from "../../src/components/visualizations/headline/HeadlineTransformation";
import {
    headlineWithOneMeasure,
    headlineWithTwoMeasures,
    headlineWithAMMeasure,
} from "../data/headlineExecutionFixtures";
import { createHighChartResolver, ScreenshotReadyWrapper } from "../utils/ScreenshotReadyWrapper";

const onFiredDrillEvent = ({
    executionContext,
    drillContext,
}: {
    executionContext: any;
    drillContext: any;
}) => {
    console.log("onFiredDrillEvent", { executionContext, drillContext }); // tslint:disable-line:no-console
    return false;
};

const eventAction = decorateAction([
    (...args: any[]) => {
        return [args[0][0].detail];
    },
]);

const defaultColumnChartProps = {
    config: {
        type: "column",
    },
    onDataTooLarge: noop,
};

document.addEventListener("drill", eventAction("drill"));

storiesOf("Internal/Drilldown", module)
    .add("Column chart with 6 pop measures and view by attribute", () => {
        const dataSet = fixtures.barChartWith6PopMeasuresAndViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
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
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("Column chart with 6 previous period measures", () => {
        const dataSet = fixtures.barChartWith6PreviousPeriodMeasures;
        return screenshotWrap(
            wrap(
                <Visualization
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
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
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("Line chart drillable by measure", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    config={{
                        type: "line",
                        legend: {
                            enabled: false,
                        },
                    }}
                    onDataTooLarge={noop}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Line chart with onFiredDrillEvent", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            <div>
                <p>Line chart with standard onFiredDrillEvent callback</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "line",
                            legend: {
                                enabled: false,
                            },
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>
                    Line chart with onFiredDrillEvent where drillEvent is logged into console and default
                    event is prevented
                </p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "line",
                            legend: {
                                enabled: false,
                            },
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
            </div>,
        );
    })
    .add("Bar chart with view by attribute drillable by measure", () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Bar chart with view by attribute drillable by attribute", () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Bar chart with view by attribute drillable by attribute value", () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[VIEW_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Stacked bar chart drillable by measure", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Stacked bar chart drillable by stack by attribute", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Stacked bar chart drillable by view by attribute value", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[VIEW_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Stacked bar chart drillable by stack by attribute value", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    {...defaultColumnChartProps}
                    drillableItems={[
                        {
                            uri:
                                dataSet.executionResult.headerItems[STACK_BY_DIMENSION_INDEX][0][0]
                                    .attributeHeaderItem.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Area chart drillable by measure", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            wrap(
                <Visualization
                    config={{
                        type: "area",
                        legend: {
                            enabled: false,
                        },
                    }}
                    onDataTooLarge={noop}
                    drillableItems={[
                        {
                            uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                        },
                    ]}
                    {...dataSet}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Area chart with onFiredDrillEvent", () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;
        return screenshotWrap(
            <div>
                <p>Area chart with standard onFiredDrillEvent callback</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "area",
                            legend: {
                                enabled: false,
                            },
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>
                    Area chart with onFiredDrillEvent where drillEvent is logged into console and default
                    event is prevented
                </p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "area",
                            legend: {
                                enabled: false,
                            },
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
            </div>,
        );
    })
    .add("Table (legacy drillable items)", () =>
        screenshotWrap(
            wrap(
                <Visualization
                    config={{ type: "table" }}
                    executionRequest={{
                        afm: EXECUTION_REQUEST_POP.execution.afm,
                        resultSpec: EXECUTION_REQUEST_POP.execution.resultSpec,
                    }}
                    executionResponse={EXECUTION_RESPONSE_POP}
                    executionResult={EXECUTION_RESULT_POP}
                    onDataTooLarge={noop}
                    onNegativeValues={noop}
                    onLegendReady={noop}
                    width={600}
                    height={400}
                    drillableItems={[
                        {
                            uri: (TABLE_HEADERS_POP[0] as Execution.IAttributeHeader).attributeHeader.uri,
                            identifier: (TABLE_HEADERS_POP[0] as Execution.IAttributeHeader).attributeHeader
                                .localIdentifier,
                        },
                        {
                            uri: (TABLE_HEADERS_POP[1] as Execution.IMeasureHeaderItem).measureHeaderItem.uri,
                            identifier: (TABLE_HEADERS_POP[1] as Execution.IMeasureHeaderItem)
                                .measureHeaderItem.localIdentifier,
                        },
                        {
                            uri: (TABLE_HEADERS_POP[2] as Execution.IMeasureHeaderItem).measureHeaderItem.uri,
                            identifier: (TABLE_HEADERS_POP[2] as Execution.IMeasureHeaderItem)
                                .measureHeaderItem.localIdentifier,
                        },
                    ]}
                />,
            ),
        ),
    )
    .add("Table with drill on master measure only (legacy drillable items)", () =>
        screenshotWrap(
            wrap(
                <Visualization
                    config={{ type: "table" }}
                    executionRequest={{
                        afm: EXECUTION_REQUEST_POP.execution.afm,
                        resultSpec: EXECUTION_REQUEST_POP.execution.resultSpec,
                    }}
                    executionResponse={EXECUTION_RESPONSE_POP}
                    executionResult={EXECUTION_RESULT_POP}
                    onDataTooLarge={noop}
                    onNegativeValues={noop}
                    onLegendReady={noop}
                    width={600}
                    height={400}
                    drillableItems={[
                        {
                            uri: (TABLE_HEADERS_POP[2] as Execution.IMeasureHeaderItem).measureHeaderItem.uri,
                            identifier: (TABLE_HEADERS_POP[2] as Execution.IMeasureHeaderItem)
                                .measureHeaderItem.localIdentifier,
                        },
                    ]}
                />,
            ),
        ),
    )
    .add("Table with AM (drillable predicates + legacy drillable items)", () =>
        screenshotWrap(
            wrap(
                <Visualization
                    config={{ type: "table" }}
                    executionRequest={{
                        afm: EXECUTION_REQUEST_AM.execution.afm,
                        resultSpec: EXECUTION_REQUEST_AM.execution.resultSpec,
                    }}
                    executionResponse={EXECUTION_RESPONSE_AM}
                    executionResult={EXECUTION_RESULT_AM}
                    onDataTooLarge={noop}
                    onNegativeValues={noop}
                    onLegendReady={noop}
                    width={800}
                    height={400}
                    drillableItems={[
                        { uri: TABLE_HEADERS_AM[0].measureHeaderItem.uri },
                        headerPredicateFactory.uriMatch(TABLE_HEADERS_AM[1].measureHeaderItem.uri),
                        headerPredicateFactory.identifierMatch(
                            TABLE_HEADERS_AM[2].measureHeaderItem.identifier,
                        ),
                        headerPredicateFactory.composedFromUri(TABLE_HEADERS_AM[0].measureHeaderItem.uri),
                        headerPredicateFactory.composedFromIdentifier(
                            TABLE_HEADERS_AM[1].measureHeaderItem.identifier,
                        ),
                    ]}
                />,
                400,
                800,
            ),
        ),
    )
    .add("Pivot table with drillable predicates + legacy drillable items", () =>
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <PivotTable
                    projectId="storybook"
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    measures={[MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1]}
                    drillableItems={[
                        { uri: "/gdc/md/storybook/obj/2" },
                        headerPredicateFactory.uriMatch("/gdc/md/storybook/obj/1"),
                    ]}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("Pivot table with AM drillable predicates", () =>
        screenshotWrap(
            <div style={{ width: 600, height: 300 }}>
                <PivotTable
                    projectId="storybook"
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    measures={[MEASURE_AM_1_2, MEASURE_1, MEASURE_2]}
                    rows={[ATTRIBUTE_1]}
                    drillableItems={[headerPredicateFactory.composedFromUri("/gdc/md/storybook/obj/1")]}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("Combo chart with onFiredDrillEvent", () => {
        const dataSet = {
            ...fixtures.comboWithTwoMeasuresAndViewByAttribute,
        };
        return screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                <div>
                    <p>Combo chart with drilling on measure</p>
                    {wrap(
                        <Visualization
                            onFiredDrillEvent={action("onFiredDrillEvent")}
                            config={{
                                type: "combo",
                                dualAxis: false,
                                mdObject: fixtures.comboWithTwoMeasuresAndViewByAttributeMdObject,
                            }}
                            onDataTooLarge={noop}
                            onNegativeValues={noop}
                            {...dataSet}
                            drillableItems={[
                                {
                                    uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                                },
                                {
                                    uri: dataSet.executionRequest.afm.measures[1].definition.measure.item.uri,
                                },
                            ]}
                        />,
                        500,
                        "100%",
                    )}
                    <p>Combo chart with drilling on attribute and logging to console</p>
                    {wrap(
                        <Visualization
                            onFiredDrillEvent={onFiredDrillEvent}
                            config={{
                                type: "combo",
                                dualAxis: false,
                                mdObject: fixtures.comboWithTwoMeasuresAndViewByAttributeMdObject,
                            }}
                            onDataTooLarge={noop}
                            onNegativeValues={noop}
                            {...dataSet}
                            drillableItems={[
                                {
                                    uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                                },
                            ]}
                        />,
                        500,
                        "100%",
                    )}
                </div>
            </ScreenshotReadyWrapper>,
        );
    })
    .add("Scatter plot with onFiredDrillEvent", () => {
        const dataSet = fixtures.scatterPlotWith2MetricsAndAttribute;
        return screenshotWrap(
            <div>
                <p>Scatter plot with standard onFiredDrillEvent callback</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "scatter",
                            mdObject: dataSet.mdObject,
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>Scatter plot with drilling on attribute</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "scatter",
                            mdObject: dataSet.mdObject,
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>Scatter plot with drilling on attribute element "Educationly"</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "scatter",
                            mdObject: dataSet.mdObject,
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionResult.headerItems[0][0][1].attributeHeaderItem.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>
                    Scatter plot with onFiredDrillEvent where drillEvent is logged into console and default
                    event is prevented
                </p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "scatter",
                            mdObject: dataSet.mdObject,
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
            </div>,
        );
    })
    .add("Bubble chart with onFiredDrillEvent", () => {
        const dataSet = {
            ...fixtures.bubbleChartWith3MetricsAndAttribute,
        };
        return screenshotWrap(
            <div>
                <p>Bubble chart with drilling on measure</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "bubble",
                            mdObject: fixtures.bubbleChartWith3MetricsAndAttributeMd.mdObject,
                        }}
                        onDataTooLarge={noop}
                        onNegativeValues={noop}
                        {...dataSet}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                    />,
                    500,
                    "100%",
                )}
                <p>Bubble chart with drilling on attribute and logging to console</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "bubble",
                            mdObject: fixtures.bubbleChartWith3MetricsAndAttributeMd.mdObject,
                        }}
                        onDataTooLarge={noop}
                        onNegativeValues={noop}
                        {...dataSet}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                            },
                        ]}
                    />,
                    500,
                    "100%",
                )}
            </div>,
        );
    })
    .add("Bubble chart with AM drilling", () => {
        const dataSet = {
            ...fixtures.bubbleChartWith3AMMetricsAndAttribute,
        };
        return screenshotWrap(
            wrap(
                <Visualization
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    config={{
                        type: "bubble",
                        mdObject: dataSet.mdObject,
                    }}
                    onDataTooLarge={noop}
                    onNegativeValues={noop}
                    {...dataSet}
                    drillableItems={[
                        headerPredicateFactory.composedFromUri(
                            "/gdc/md/hzyl5wlh8rnu0ixmbzlaqpzf09ttb7c8/obj/67097",
                        ),
                    ]}
                />,
                500,
                "100%",
            ),
        );
    })
    .add("Treemap with onFiredDrillEvent", () => {
        const dataSetWithManyMeasure = {
            ...fixtures.treemapWithTwoMetricsAndStackByAttribute,
        };
        const dataSet = {
            ...fixtures.treemapWithMetricViewByAndStackByAttribute,
        };
        return screenshotWrap(
            <div>
                <p>Treemap with drilling on one measure from two</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "treemap",
                            mdObject: dataSetWithManyMeasure.mdObject,
                        }}
                        onDataTooLarge={noop}
                        onNegativeValues={noop}
                        {...dataSetWithManyMeasure}
                        drillableItems={[
                            {
                                uri:
                                    dataSetWithManyMeasure.executionRequest.afm.measures[0].definition.measure
                                        .item.uri,
                            },
                        ]}
                    />,
                    500,
                    "100%",
                )}
                <p>Treemap with drilling on view by attribute and logging to console</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "treemap",
                            mdObject: dataSet.mdObject,
                        }}
                        onDataTooLarge={noop}
                        onNegativeValues={noop}
                        {...dataSet}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                            },
                        ]}
                    />,
                    500,
                    "100%",
                )}
                <p>Treemap with drilling on segment by attribute element and logging to console</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "treemap",
                            mdObject: dataSet.mdObject,
                        }}
                        onDataTooLarge={noop}
                        onNegativeValues={noop}
                        {...dataSet}
                        drillableItems={[
                            {
                                uri:
                                    dataSet.executionResult.headerItems[STACK_BY_DIMENSION_INDEX][1][0]
                                        .attributeHeaderItem.uri,
                            },
                        ]}
                    />,
                    500,
                    "100%",
                )}
            </div>,
        );
    })
    .add("Heatmap with onFiredDrillEvent", () => {
        const dataSet = fixtures.heatmapMetricRowColumn;
        return screenshotWrap(
            <div>
                <p>Heatmap drillable by measure</p>
                {wrap(
                    <Visualization
                        config={{
                            type: "heatmap",
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>Heatmap drillable by attribute</p>
                {wrap(
                    <Visualization
                        config={{
                            type: "heatmap",
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.attributes[0].displayForm.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>Heatmap drillable by attribute element</p>
                {wrap(
                    <Visualization
                        config={{
                            type: "heatmap",
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri:
                                    dataSet.executionResult.headerItems[STACK_BY_DIMENSION_INDEX][0][0]
                                        .attributeHeaderItem.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>Heatmap with standard onFiredDrillEvent callback</p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={action("onFiredDrillEvent")}
                        config={{
                            type: "heatmap",
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
                <p>
                    Heatmap with onFiredDrillEvent where drillEvent is logged into console and default event
                    is prevented
                </p>
                {wrap(
                    <Visualization
                        onFiredDrillEvent={onFiredDrillEvent}
                        config={{
                            type: "heatmap",
                        }}
                        onDataTooLarge={noop}
                        drillableItems={[
                            {
                                uri: dataSet.executionRequest.afm.measures[0].definition.measure.item.uri,
                            },
                        ]}
                        {...dataSet}
                    />,
                    500,
                    "100%",
                )}
            </div>,
        );
    })
    .add("Headline drillable primary value", () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={headlineWithOneMeasure.executionRequest}
                    executionResponse={headlineWithOneMeasure.executionResponse}
                    executionResult={headlineWithOneMeasure.executionResult}
                    drillableItems={[
                        headerPredicateFactory.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                    ]}
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    onAfterRender={action("onAfterRender")}
                />,
                "auto",
                300,
            ),
        ),
    )
    .add("Headline drillable secondary value", () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={headlineWithTwoMeasures.executionRequest}
                    executionResponse={headlineWithTwoMeasures.executionResponse}
                    executionResult={headlineWithTwoMeasures.executionResult}
                    drillableItems={[
                        headerPredicateFactory.uriMatch("/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283"),
                        { uri: "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1284" },
                    ]}
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    onAfterRender={action("onAfterRender")}
                />,
                "auto",
                300,
            ),
        ),
    )
    .add("Headline drillable AM", () =>
        screenshotWrap(
            wrap(
                <HeadlineTransformation
                    executionRequest={headlineWithAMMeasure.executionRequest}
                    executionResponse={headlineWithAMMeasure.executionResponse}
                    executionResult={headlineWithAMMeasure.executionResult}
                    drillableItems={[
                        headerPredicateFactory.composedFromUri(
                            "/gdc/md/d20eyb3wfs0xe5l0lfscdnrnyhq1t42q/obj/1283",
                        ),
                    ]}
                    onFiredDrillEvent={action("onFiredDrillEvent")}
                    onAfterRender={action("onAfterRender")}
                />,
                "auto",
                300,
            ),
        ),
    );
