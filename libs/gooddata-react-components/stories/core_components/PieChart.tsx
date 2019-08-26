// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { IChartConfig, PieChart } from "../../src";
import { onErrorHandler } from "../mocks";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_1_WITH_LONG_NAME_AND_FORMAT,
    MEASURE_2,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG,
    CUSTOM_COLOR_PALETTE_CONFIG,
} from "../data/configProps";
import { attributeItemNameMatch } from "../../src/factory/HeaderPredicateFactory";
import { RGBType } from "@gooddata/gooddata-js";
import { VisualizationObject } from "@gooddata/typings";
import { PositionType } from "../../src/components/visualizations/typings/legend";
import { createHighChartResolver, ScreenshotReadyWrapper } from "../utils/ScreenshotReadyWrapper";

const wrapperStyle = { width: 400, height: 400 };

function PieChartWithConfig(customProps: {
    config?: IChartConfig;
    measures?: VisualizationObject.BucketItem[];
    viewBy?: VisualizationObject.IVisualizationAttribute;
}) {
    return (
        <div style={wrapperStyle} className="screenshot-container">
            <PieChart
                projectId="storybook"
                measures={[MEASURE_1]}
                viewBy={ATTRIBUTE_1}
                onError={onErrorHandler}
                LoadingComponent={null}
                ErrorComponent={null}
                {...customProps}
            />
        </div>
    );
}

function createLegendConfig(position: PositionType): IChartConfig {
    return {
        legend: {
            position,
        },
    };
}

storiesOf("Core components/PieChart", module)
    .add("two measures", () =>
        screenshotWrap(<PieChartWithConfig measures={[MEASURE_1, MEASURE_2]} viewBy={null} />),
    )
    .add("measure and attribute", () => screenshotWrap(<PieChartWithConfig />))
    .add("one measure with alias, one attribute with alias", () =>
        screenshotWrap(
            <PieChartWithConfig measures={[MEASURE_1_WITH_ALIAS]} viewBy={ATTRIBUTE_1_WITH_ALIAS} />,
        ),
    )
    .add("with German number format in tooltip", () =>
        screenshotWrap(<PieChartWithConfig config={GERMAN_SEPARATORS} />),
    )
    .add("with disabled legend", () =>
        screenshotWrap(
            <PieChartWithConfig
                config={{
                    legend: {
                        enabled: false,
                    },
                }}
            />,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <PieChartWithConfig
                measures={[
                    MEASURE_1,
                    MEASURE_2,
                    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                    ARITHMETIC_MEASURE_USING_ARITHMETIC,
                ]}
                viewBy={null}
            />,
        ),
    )
    .add("measure and attribute with custom colors", () =>
        screenshotWrap(
            <PieChartWithConfig
                config={{
                    ...CUSTOM_COLOR_PALETTE_CONFIG,
                }}
            />,
        ),
    )
    .add("measure and attribute with color mapping", () =>
        screenshotWrap(
            <PieChartWithConfig
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
            />,
        ),
    )
    .add("measure and attribute with invalid color assignment", () =>
        screenshotWrap(
            <PieChartWithConfig
                config={{
                    ...CUSTOM_COLOR_PALETTE_CONFIG,
                    colorMapping: [
                        {
                            predicate: attributeItemNameMatch("Red"),
                            color: {
                                type: "guid",
                                value: "xx",
                            },
                        },
                        {
                            predicate: attributeItemNameMatch("Purple"),
                            color: {
                                type: "guid",
                                value: "xxx",
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
            />,
        ),
    )
    .add("with different legend positions", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(5)}>
                <div>
                    <div className="storybook-title">default = auto</div>
                    <PieChartWithConfig config={createLegendConfig("auto")} />
                    <div className="storybook-title">left</div>
                    <PieChartWithConfig config={createLegendConfig("left")} />
                    <div className="storybook-title">top</div>
                    <PieChartWithConfig config={createLegendConfig("top")} />
                    <div className="storybook-title">right</div>
                    <PieChartWithConfig config={createLegendConfig("right")} />
                    <div className="storybook-title">bottom</div>
                    <PieChartWithConfig config={createLegendConfig("bottom")} />
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("data labels config", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(4)}>
                <div>
                    <div className="storybook-title">default = hidden</div>
                    <PieChartWithConfig viewBy={ATTRIBUTE_3} />
                    <div className="storybook-title">auto</div>
                    <PieChartWithConfig viewBy={ATTRIBUTE_3} config={DATA_LABELS_AUTO_CONFIG} />
                    <div className="storybook-title">show</div>
                    <PieChartWithConfig viewBy={ATTRIBUTE_3} config={DATA_LABELS_VISIBLE_CONFIG} />
                    <div className="storybook-title">hide</div>
                    <PieChartWithConfig viewBy={ATTRIBUTE_3} config={DATA_LABELS_HIDDEN_CONFIG} />
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("tooltip for chart with small width and long names", () =>
        screenshotWrap(
            <div style={{ width: 300, height: 400 }}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_LONG_NAME_AND_FORMAT]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    );
