// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { ColumnChart, IChartConfig, VisualizationTypes } from "../../src";
import { onErrorHandler } from "../mocks";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_2,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_2,
    MEASURE_3,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import { CUSTOM_COLOR_PALETTE_CONFIG } from "../data/configProps";

import { ScreenshotReadyWrapper, createHighChartResolver } from "../utils/ScreenshotReadyWrapper";

import * as HeaderPredicateFactory from "../../src/factory/HeaderPredicateFactory";
import { wrap } from "../utils/wrap";
import { Visualization } from "../../src/components/visualizations/Visualization";
import { dualChartWithComputedAttribute } from "../test_data/fixtures";

const wrapperStyle = { width: 800, height: 400 };

storiesOf("Core components/ColumnChart", module)
    .add("two measures, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("two measures, one attribute with alias", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("custom colors", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={CUSTOM_COLOR_PALETTE_CONFIG}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("sorted by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[ATTRIBUTE_1_SORT_ITEM]}
                />
            </div>,
        ),
    )
    .add("sorted by measure", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[MEASURE_2_SORT_ITEM]}
                />
            </div>,
        ),
    )
    .add("with German number format", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("with disabled legend", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            enabled: false,
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("with min max config", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        yaxis: {
                            min: "200",
                            max: "750",
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("with different legend positions", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(5)}>
                <div>
                    <div className="storybook-title">default = auto</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ColumnChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={{
                                legend: {
                                    position: "auto",
                                },
                            }}
                        />
                    </div>
                    <div className="storybook-title">left</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ColumnChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={{
                                legend: {
                                    position: "left",
                                },
                            }}
                        />
                    </div>
                    <div className="storybook-title">top</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ColumnChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={{
                                legend: {
                                    position: "top",
                                },
                            }}
                        />
                    </div>
                    <div className="storybook-title">right</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ColumnChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={{
                                legend: {
                                    position: "right",
                                },
                            }}
                        />
                    </div>
                    <div className="storybook-title">bottom</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ColumnChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={{
                                legend: {
                                    position: "bottom",
                                },
                            }}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[
                        MEASURE_1,
                        MEASURE_2,
                        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                        ARITHMETIC_MEASURE_USING_ARITHMETIC,
                    ]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("dual axis with two left measures, one right measure, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                    }}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("dual axis with small height", () => {
        const chartConfig: IChartConfig = {
            type: VisualizationTypes.COLUMN,
            legend: {
                enabled: true,
                position: "right",
            },
            secondary_yaxis: {
                measures: ["m2"],
            },
        };

        const width = 872;
        const height = 300;

        return screenshotWrap(
            wrap(
                <div style={{ height, width }}>
                    <Visualization config={chartConfig} {...dualChartWithComputedAttribute} />
                </div>,
                height + 40,
                width + 20,
            ),
        );
    })
    .add("only right axis with two measures, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_1.measure.localIdentifier, MEASURE_2.measure.localIdentifier],
                        },
                    }}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with two left measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("drillable items", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=1"),
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=3"),
                    ]}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable child items", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=1"),
                    ]}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable parent items", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=2"),
                    ]}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable child items and dual axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=2"),
                    ]}
                    config={{
                        secondary_yaxis: {
                            measures: ["m2"],
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable parent items and dual axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=2"),
                    ]}
                    config={{
                        secondary_yaxis: {
                            measures: ["m2"],
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable parent and child items and dual axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=1"),
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=2"),
                    ]}
                    config={{
                        secondary_yaxis: {
                            measures: ["m2"],
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable child items and stackBy", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    stackBy={ATTRIBUTE_3}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=1"),
                    ]}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable parent items and stackBy", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    stackBy={ATTRIBUTE_3}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=1"),
                    ]}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with two right measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_1.measure.localIdentifier, MEASURE_2.measure.localIdentifier],
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with 60-degree rotation setting on X axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        xaxis: {
                            rotation: "60",
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with hide-axis setting on X axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        xaxis: {
                            visible: false,
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with stacking attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    stackBy={ATTRIBUTE_3}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with 'Stack Measures'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        stackMeasures: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with 'Stack Measures' and enable data labels", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        stackMeasures: true,
                        dataLabels: {
                            visible: true,
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with 'Stack to 100%'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        stackMeasuresToPercent: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with 'Stack to 100%' and enabling data labels", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        stackMeasuresToPercent: true,
                        dataLabels: {
                            visible: true,
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with 'Stack to 100%' on right axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        stackMeasuresToPercent: true,
                        secondary_yaxis: {
                            measures: [MEASURE_1.measure.localIdentifier, MEASURE_2.measure.localIdentifier],
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_2.measure.localIdentifier],
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis and 'Stack Measures'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                        stackMeasures: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis and 'Stack Measures' and data labels enabled", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                        stackMeasures: true,
                        dataLabels: {
                            visible: true,
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis and 'Stack Measures' with min/max setting", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        yaxis: {
                            min: "100",
                            max: "1000",
                        },
                        secondary_yaxis: {
                            min: "200",
                            max: "800",
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                        stackMeasures: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis and 'Stack to 100%'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                        stackMeasuresToPercent: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis and 'Stack to 100%' and enabling data labels", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        dataLabels: {
                            visible: true,
                        },
                        secondary_yaxis: {
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                        stackMeasuresToPercent: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with dual axis and 'Stack to 100%' with min/max", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        yaxis: {
                            min: "0.1",
                            max: "0.9",
                        },
                        secondary_yaxis: {
                            min: "200",
                            max: "800",
                            measures: [MEASURE_3.measure.localIdentifier],
                        },
                        stackMeasuresToPercent: true,
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add('optional stacking chart ignores "stackMeasures" setting with one measure', () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_2, ATTRIBUTE_3]}
                    config={{
                        stackMeasures: true,
                    }}
                />
            </div>,
        ),
    )
    .add('optional stacking chart ignores "stackMeasuresToPercent" setting with one measure', () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_2, ATTRIBUTE_3]}
                    config={{
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    )
    .add('optional stacking chart ignores "stackMeasures" setting with one measure on each axis', () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_2.measure.localIdentifier],
                        },
                        stackMeasures: true,
                    }}
                />
            </div>,
        ),
    )
    // case 3-g in BDD - UI SDK
    .add('optional stacking chart render "stackMeasuresToPercent" setting with measure on left axis', () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_yaxis: {
                            measures: [MEASURE_2.measure.localIdentifier],
                        },
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    );
