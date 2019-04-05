// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { AreaChart } from "../../src";
import { onErrorHandler } from "../mocks";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_2,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_2,
    MEASURE_2_SORT_ITEM,
    MEASURE_WITH_NULLS,
    ATTRIBUTE_1_SORT_ITEM,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG,
} from "../data/configProps";

import { ScreenshotReadyWrapper, createHighChartResolver } from "../utils/ScreenshotReadyWrapper";

const wrapperStyle = { width: 800, height: 400 };

storiesOf("Core components/AreaChart", module)
    .add("two measures, one attribute, stack by default", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
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
    .add("disabled stack by config", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        stacking: false,
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("enabled stack by config", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        stacking: true,
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("stack by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    stackBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("disabled stack by config and stack by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    stackBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    config={{
                        stacking: false,
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("sorted by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
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
                <AreaChart
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
    .add("undefined values with stacking", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_NULLS]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("undefined values without stacking", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_NULLS]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        stacking: false,
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("with German number format in tooltip", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
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
                <AreaChart
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
    .add("with min max configuration", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        yaxis: {
                            min: "500",
                            max: "1500",
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
                        <AreaChart
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
                        <AreaChart
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
                        <AreaChart
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
                        <AreaChart
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
                        <AreaChart
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
    .add("data labels config", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(4)}>
                <div>
                    <div className="storybook-title">default = hidden</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <AreaChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                        />
                    </div>
                    <div className="storybook-title">auto</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <AreaChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={DATA_LABELS_AUTO_CONFIG}
                        />
                    </div>
                    <div className="storybook-title">show</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <AreaChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_3}
                            onError={onErrorHandler}
                            LoadingComponent={null}
                            ErrorComponent={null}
                            config={DATA_LABELS_VISIBLE_CONFIG}
                        />
                    </div>
                    <div className="storybook-title">hide</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <AreaChart
                            projectId="storybook"
                            measures={[MEASURE_1, MEASURE_2]}
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
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
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
    .add("optional stacking chart with two attributes, one measure", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart projectId="storybook" measures={[MEASURE_1]} viewBy={[ATTRIBUTE_1, ATTRIBUTE_2]} />
            </div>,
        ),
    )
    .add("optional stacking chart with one attributes, two measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1]}
                    config={{
                        stackMeasures: false,
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with one attributes, two measures and 'Stack measures'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1]}
                    config={{
                        stackMeasures: true,
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with one attributes, two measures and 'Stack to 100%'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1]}
                    config={{
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    )
    .add("optional stacking chart with one viewBy, one stackBy, one measure and 'Stack to 100%'", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1]}
                    stackBy={ATTRIBUTE_2}
                    config={{
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    )
    // tslint:disable-next-line:max-line-length
    .add(
        "optional stacking chart with one viewBy, one stackBy, one measure and 'Stack to 100%' and data labels in percent",
        () =>
            screenshotWrap(
                <div style={wrapperStyle}>
                    <AreaChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={[ATTRIBUTE_1]}
                        stackBy={ATTRIBUTE_2}
                        config={{
                            stackMeasuresToPercent: true,
                            dataLabels: {
                                visible: true,
                            },
                        }}
                    />
                </div>,
            ),
    )
    .add('optional stacking chart ignores "stackMeasuresToPercent" setting with one measure', () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1]}
                    config={{
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    );
