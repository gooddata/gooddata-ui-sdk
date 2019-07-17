// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";

import { ComboChart, VisualizationTypes } from "../../src";
import { onErrorHandler } from "../mocks";
import {
    ATTRIBUTE_1,
    ATTRIBUTE_COUNTRY,
    MEASURE_1,
    MEASURE_2,
    MEASURE_3,
    MEASURE_4,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC,
} from "../data/componentProps";
import { GERMAN_SEPARATORS } from "../data/numberFormat";
import { CUSTOM_COLOR_PALETTE_CONFIG } from "../data/configProps";
import { createHighChartResolver, ScreenshotReadyWrapper } from "../utils/ScreenshotReadyWrapper";
import { COMBO_SUPPORTED_CHARTS } from "../../src/components/visualizations/chart/chartOptions/comboChartOptions";

const wrapperStyle = { width: 800, height: 400 };
const primaryMeasure = [MEASURE_1];
const secondaryMeasure = [MEASURE_2];
const columnMeasure = [MEASURE_3];
const lineMeasure = [MEASURE_4];
const arithmeticMeasures = [ARITHMETIC_MEASURE_SIMPLE_OPERANDS, ARITHMETIC_MEASURE_USING_ARITHMETIC];
const { COLUMN, LINE, AREA } = VisualizationTypes;

const countryFilters = [];
for (let index = 1; index <= 15; index++) {
    countryFilters.push(`/gdc/md/storybook/obj/3/elements?id=${index}`);
}
const filtersByAttributeCountry = [
    {
        positiveAttributeFilter: {
            displayForm: {
                uri: "/gdc/md/storybook/obj/3.df",
            },
            in: countryFilters,
        },
    },
];

storiesOf("Core components/ComboChart", module)
    .add("dual axis with one column measure, one line measure, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("dual axis with one column measure, one area measure, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        secondaryChartType: AREA,
                    }}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("dual axis with one line measure, one area measure, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        primaryChartType: LINE,
                        secondaryChartType: AREA,
                    }}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("single axis with one column measure, one line measures, one attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={{ dualAxis: false }}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("dual axis with multiple primary measures, one secondary measure and NO attribute", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(3)}>
                {[[COLUMN, LINE], [COLUMN, AREA], [LINE, AREA]].map((types, index) => (
                    <div key={index}>
                        <div className="storybook-title">{`${types[0]} - ${types[1]}`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={[MEASURE_1, MEASURE_3]}
                                secondaryMeasures={secondaryMeasure}
                                config={{
                                    primaryChartType: types[0],
                                    secondaryChartType: types[1],
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("dual axis with different chart type and NO attribute", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(3)}>
                {[[COLUMN, LINE], [COLUMN, AREA], [LINE, AREA]].map((types, index) => (
                    <div key={index}>
                        <div className="storybook-title">{`${types[0]} - ${types[1]}`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={primaryMeasure}
                                secondaryMeasures={secondaryMeasure}
                                config={{
                                    primaryChartType: types[0],
                                    secondaryChartType: types[1],
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("dual axis with same chart type and NO attribute", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(COMBO_SUPPORTED_CHARTS.length)}>
                {COMBO_SUPPORTED_CHARTS.map(chartType => (
                    <div key={chartType}>
                        <div className="storybook-title">{`${chartType} - ${chartType}`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={primaryMeasure}
                                secondaryMeasures={secondaryMeasure}
                                config={{
                                    primaryChartType: chartType,
                                    secondaryChartType: chartType,
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("dual axis with same chart type and one attribute", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(COMBO_SUPPORTED_CHARTS.length)}>
                {COMBO_SUPPORTED_CHARTS.map(chartType => (
                    <div key={chartType}>
                        <div className="storybook-title">{`${chartType} - ${chartType}`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={primaryMeasure}
                                secondaryMeasures={secondaryMeasure}
                                viewBy={ATTRIBUTE_1}
                                config={{
                                    primaryChartType: chartType,
                                    secondaryChartType: chartType,
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("empty secondary measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={[]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("empty primary measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={[]}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>,
        ),
    )
    .add("should override primaryMeasures & secondaryMeasures", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(3)}>
                <div style={wrapperStyle} className="screenshot-container">
                    <ComboChart
                        projectId="storybook"
                        columnMeasures={columnMeasure}
                        lineMeasures={lineMeasure}
                        primaryMeasures={primaryMeasure}
                        secondaryMeasures={secondaryMeasure}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                    />
                </div>
                <div style={wrapperStyle} className="screenshot-container">
                    <ComboChart
                        projectId="storybook"
                        columnMeasures={columnMeasure}
                        primaryMeasures={primaryMeasure}
                        secondaryMeasures={secondaryMeasure}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                    />
                </div>
                <div style={wrapperStyle} className="screenshot-container">
                    <ComboChart
                        projectId="storybook"
                        lineMeasures={lineMeasure}
                        primaryMeasures={primaryMeasure}
                        secondaryMeasures={secondaryMeasure}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                    />
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("stack primary measures with different chart type", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                {[COLUMN, AREA].map(chartType => (
                    <div key={chartType}>
                        <div className="storybook-title">{`${chartType} - line`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={[MEASURE_1, MEASURE_3]}
                                secondaryMeasures={secondaryMeasure}
                                viewBy={ATTRIBUTE_1}
                                config={{
                                    primaryChartType: chartType,
                                    stackMeasures: true,
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("stack primary measures with same chart type and custom width style", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                {[COLUMN, AREA].map(chartType => (
                    <div key={chartType}>
                        <div className="storybook-title">{`${chartType} - ${chartType}`}</div>
                        <div
                            style={{
                                ...wrapperStyle,
                                width: 1000,
                            }}
                            className="screenshot-container"
                        >
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={[MEASURE_1, MEASURE_3]}
                                secondaryMeasures={secondaryMeasure}
                                viewBy={ATTRIBUTE_1}
                                config={{
                                    primaryChartType: chartType,
                                    secondaryChartType: chartType,
                                    stackMeasures: true,
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("stack primary measures has many data with 1 VIEW BY and chart type is COLUMN", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                <div key={COLUMN}>
                    <div className="storybook-title">{`${COLUMN} - ${COLUMN}`}</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ComboChart
                            projectId="storybook"
                            primaryMeasures={[MEASURE_1, MEASURE_3]}
                            secondaryMeasures={secondaryMeasure}
                            viewBy={ATTRIBUTE_COUNTRY}
                            config={{
                                primaryChartType: COLUMN,
                                secondaryChartType: COLUMN,
                                stackMeasures: true,
                            }}
                            onError={onErrorHandler}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("stack primary measures has many data with 1 VIEW BY and chart type is COLUMN to percent", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                <div key={COLUMN}>
                    <div className="storybook-title">{`${COLUMN} - ${COLUMN}`}</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ComboChart
                            projectId="storybook"
                            primaryMeasures={[MEASURE_1, MEASURE_3]}
                            secondaryMeasures={secondaryMeasure}
                            viewBy={ATTRIBUTE_COUNTRY}
                            filters={filtersByAttributeCountry}
                            config={{
                                primaryChartType: COLUMN,
                                secondaryChartType: COLUMN,
                                stackMeasures: true,
                                stackMeasuresToPercent: true,
                            }}
                            onError={onErrorHandler}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("stack primary measures to percent", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                {[COLUMN, AREA].map(chartType => (
                    <div key={chartType}>
                        <div className="storybook-title">{`${chartType} - line`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={[MEASURE_1, MEASURE_3]}
                                secondaryMeasures={secondaryMeasure}
                                viewBy={ATTRIBUTE_1}
                                config={{
                                    primaryChartType: chartType,
                                    stackMeasuresToPercent: true,
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("discard stacking measures for line chart and all measures on secondary axis", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                {[COLUMN, AREA].map(chartType => (
                    <div key={chartType}>
                        <div className="storybook-title">{`line - ${chartType}`}</div>
                        <div style={wrapperStyle} className="screenshot-container">
                            <ComboChart
                                projectId="storybook"
                                primaryMeasures={[MEASURE_1, MEASURE_2]}
                                secondaryMeasures={[MEASURE_3, ARITHMETIC_MEASURE_SIMPLE_OPERANDS]}
                                viewBy={ATTRIBUTE_1}
                                config={{
                                    primaryChartType: LINE,
                                    secondaryChartType: chartType,
                                    stackMeasures: true,
                                }}
                                onError={onErrorHandler}
                            />
                        </div>
                    </div>
                ))}
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("empty primary measure & discard stacking", () =>
        screenshotWrap(
            <ScreenshotReadyWrapper resolver={createHighChartResolver(2)}>
                <div>
                    <div className="storybook-title">Discard stacking measures</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ComboChart
                            projectId="storybook"
                            secondaryMeasures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            config={{
                                secondaryChartType: COLUMN,
                                stackMeasures: true,
                            }}
                        />
                    </div>
                </div>
                <div>
                    <div className="storybook-title">Discard stacking measures to percent</div>
                    <div style={wrapperStyle} className="screenshot-container">
                        <ComboChart
                            projectId="storybook"
                            secondaryMeasures={[MEASURE_1, MEASURE_2]}
                            viewBy={ATTRIBUTE_1}
                            onError={onErrorHandler}
                            config={{
                                secondaryChartType: COLUMN,
                                stackMeasuresToPercent: true,
                            }}
                        />
                    </div>
                </div>
            </ScreenshotReadyWrapper>,
        ),
    )
    .add("custom colors", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={CUSTOM_COLOR_PALETTE_CONFIG}
                />
            </div>,
        ),
    )
    .add("sorted by attribute", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
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
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
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
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={secondaryMeasure}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("arithmetic measures", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={primaryMeasure}
                    secondaryMeasures={arithmeticMeasures}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>,
        ),
    )
    .add("column and line on left axis with 'Stack Measures' off and 'Stack to 100%' on", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={[MEASURE_1, MEASURE_2]}
                    secondaryMeasures={[MEASURE_3]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        dualAxis: false,
                        stackMeasures: false,
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    )
    .add("column and line on left axis with 'Stack Measures' on and 'Stack to 100%' on", () =>
        screenshotWrap(
            <div style={wrapperStyle}>
                <ComboChart
                    projectId="storybook"
                    primaryMeasures={[MEASURE_1, MEASURE_2]}
                    secondaryMeasures={[MEASURE_3]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        dualAxis: false,
                        stackMeasures: true,
                        stackMeasuresToPercent: true,
                    }}
                />
            </div>,
        ),
    );
