// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { BarChart, HeaderPredicateFactory } from "../../src";
import { onErrorHandler } from "../mocks";
import { CUSTOM_COLORS } from "../data/colors";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_2,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    MEASURE_3,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
    MEASURE_1_POP,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import { CUSTOM_COLOR_PALETTE_CONFIG } from "../data/configProps";
import { Execution } from "@gooddata/typings";
import { attributeItemNameMatch } from "../../src/factory/HeaderPredicateFactory";
import { RGBType } from "@gooddata/gooddata-js";
import { ScreenshotReadyWrapper, createHighChartResolver } from "../utils/ScreenshotReadyWrapper";

const wrapperStyle = { width: 800, height: 400 };

storiesOf("Core components/BarChart", module)
    .add("two measures, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
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
    .add("stacked", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_2}
                    stackBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("one measure with alias", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("custom colors by palette", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_2}
                    stackBy={ATTRIBUTE_1}
                    config={CUSTOM_COLOR_PALETTE_CONFIG}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("custom colors by colors", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_2}
                    stackBy={ATTRIBUTE_1}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("when both color props, prefer palette", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_2}
                    stackBy={ATTRIBUTE_1}
                    config={{
                        ...CUSTOM_COLOR_PALETTE_CONFIG,
                        colors: ["rgb(255, 0, 0)", "rgb(0, 255, 0)"],
                    }}
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
                <BarChart
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
                <BarChart
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
                <BarChart
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
    .add("with dataLabels explicitly hidden", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        dataLabels: {
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
    .add("with disabled legend", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        legend: {
                            enabled: false,
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("with min max config", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        xaxis: {
                            min: "100",
                            max: "600",
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
                        <BarChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            config={{
                                legend: {
                                    position: "auto",
                                },
                            }}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                    <div className="storybook-title">left</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BarChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            config={{
                                legend: {
                                    position: "left",
                                },
                            }}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                    <div className="storybook-title">top</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BarChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            config={{
                                legend: {
                                    position: "top",
                                },
                            }}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                    <div className="storybook-title">right</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BarChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            config={{
                                legend: {
                                    position: "right",
                                },
                            }}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                    <div className="storybook-title">bottom</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BarChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            config={{
                                legend: {
                                    position: "bottom",
                                },
                            }}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
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
    .add("dual axis with two bottom measures, one top measure, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    config={{
                        secondary_xaxis: {
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
    .add("only top axis with two measures, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    config={{
                        secondary_xaxis: {
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
    .add("one measure, one attribute, with color mapping", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_1_POP]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        ...CUSTOM_COLOR_PALETTE_CONFIG,
                        colorMapping: [
                            {
                                predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                                    headerItem.measureHeaderItem &&
                                    headerItem.measureHeaderItem.localIdentifier === "m1",
                                color: {
                                    type: "guid",
                                    value: "04",
                                },
                            },
                            {
                                predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                                    headerItem.measureHeaderItem &&
                                    headerItem.measureHeaderItem.localIdentifier === "m2",
                                color: {
                                    type: "guid",
                                    value: "02",
                                },
                            },
                            {
                                predicate: (headerItem: Execution.IMeasureHeaderItem) =>
                                    headerItem.measureHeaderItem &&
                                    headerItem.measureHeaderItem.localIdentifier === "m1_pop",
                                color: {
                                    type: "rgb" as RGBType,
                                    value: {
                                        r: 0,
                                        g: 0,
                                        b: 0,
                                    },
                                },
                            },
                        ],
                    }}
                />
            </div>,
        ),
    )
    .add("stacked with color mapping", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_2}
                    stackBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        ...CUSTOM_COLOR_PALETTE_CONFIG,
                        colorMapping: [
                            {
                                predicate: attributeItemNameMatch("Red"),
                                color: {
                                    type: "guid",
                                    value: "03",
                                },
                            },
                            {
                                predicate: attributeItemNameMatch("Purple"),
                                color: {
                                    type: "guid",
                                    value: "02",
                                },
                            },
                            {
                                predicate: attributeItemNameMatch("Pink"),
                                color: {
                                    type: "rgb" as RGBType,
                                    value: {
                                        r: 0,
                                        g: 0,
                                        b: 0,
                                    },
                                },
                            },
                        ],
                    }}
                />
            </div>,
        ),
    )
    .add("drillable items", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
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
                <BarChart
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
                <BarChart
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=2"),
                    ]}
                    config={{
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=2"),
                    ]}
                    config={{
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=1"),
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/4/elements?id=2"),
                    ]}
                    config={{
                        secondary_xaxis: {
                            measures: ["m2"],
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable items and dual axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=1"),
                    ]}
                    config={{
                        secondary_xaxis: {
                            measures: ["m2"],
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with drillable items and stackBy", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    stackBy={ATTRIBUTE_3}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch("/gdc/md/storybook/obj/5/elements?id=2"),
                    ]}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with two bottom measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        yaxis: {
                            rotation: "0",
                        },
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with two top measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        yaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        yaxis: {
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
                <BarChart
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
                <BarChart
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
    .add("optional stacking chart with 'Stack to 100%'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
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
    .add("optional stacking chart with 'Stack to 100%' on top axis", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        stackMeasuresToPercent: true,
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_xaxis: {
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        xaxis: {
                            min: "0.1",
                            max: "0.9",
                        },
                        secondary_xaxis: {
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
                <BarChart
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
                <BarChart
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
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_xaxis: {
                            measures: [MEASURE_2.measure.localIdentifier],
                        },
                        stackMeasures: true,
                    }}
                />
            </div>,
        ),
    )
    // case 3-g in BDD - UI SDK
    .add('optional stacking chart render "stackMeasuresToPercent" setting with measure on top axis', () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BarChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]}
                    config={{
                        secondary_xaxis: {
                            measures: [MEASURE_2.measure.localIdentifier],
                        },
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    );
