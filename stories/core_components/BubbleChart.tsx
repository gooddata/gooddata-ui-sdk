// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { BubbleChart } from "../../src";
import { onErrorHandler } from "../mocks";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_2,
    MEASURE_3,
    ATTRIBUTE_1_SORT_ITEM,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG,
} from "../data/configProps";
import { attributeItemNameMatch } from "../../src/factory/HeaderPredicateFactory";

import { ScreenshotReadyWrapper, createHighChartResolver } from "../utils/ScreenshotReadyWrapper";

const wrapperStyle = { width: 800, height: 400 };

storiesOf("Core components/BubbleChart", module)
    .add("basic render", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("sort by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[
                        {
                            attributeSortItem: {
                                ...ATTRIBUTE_1_SORT_ITEM.attributeSortItem,
                                direction: "desc",
                            },
                        },
                    ]}
                />
            </div>,
        ),
    )
    .add("without y axis measure", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("without size measure", () =>
        screenshotWrap(
            <div style={wrapperStyle} className="screenshot-container">
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={DATA_LABELS_VISIBLE_CONFIG}
                />
            </div>,
        ),
    )
    .add("with German number format", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("with color mapping", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        colorMapping: [
                            {
                                predicate: attributeItemNameMatch("Pink"),
                                color: {
                                    type: "rgb",
                                    value: {
                                        r: 0,
                                        g: 0,
                                        b: 0,
                                    },
                                },
                            },
                        ],
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
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
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
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        xaxis: {
                            min: "600",
                            max: "1000",
                        },
                        yaxis: {
                            min: "750",
                            max: "950",
                        },
                    }}
                />
            </div>,
        ),
    )
    .add("with only max config on xaxis", () =>
        // #SD-479
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        xaxis: {
                            max: "500",
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
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
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
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
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
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
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
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
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
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
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
    .add("data labels config", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(4)}>
                <div>
                    <div className="storybook-title">default = hidden</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                    <div className="storybook-title">auto</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={DATA_LABELS_AUTO_CONFIG}
                        />
                    </div>
                    <div className="storybook-title">show</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={DATA_LABELS_VISIBLE_CONFIG}
                        />
                    </div>
                    <div className="storybook-title">hide</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <BubbleChart
                            projectId="storybook"
                            xAxisMeasure={MEASURE_1}
                            yAxisMeasure={MEASURE_2}
                            size={MEASURE_3}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={DATA_LABELS_HIDDEN_CONFIG}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("arithmetic measure", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={ARITHMETIC_MEASURE_SIMPLE_OPERANDS}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("long name of X and Y axes are truncated", () => {
        const longText =
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia risus tincidunt gravida ullamcorper.";
        return screenshotWrap(
            <div style={wrapperStyle}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={(MEASURE_1 as any).alias(longText)}
                    yAxisMeasure={(MEASURE_2 as any).alias(longText)}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        );
    });
