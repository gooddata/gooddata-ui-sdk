// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { storiesOf } from "@storybook/react";
import { screenshotWrap } from "@gooddata/test-storybook";
import { Visualization } from "../../src/components/visualizations/Visualization";
import { wrap } from "../utils/wrap";
import "../../styles/scss/charts.scss";
import {
    barChartWith4MetricsAndViewBy2Attribute,
    barChartWith4MetricsAndViewBy2AttributeAndSomeNullDataPoint,
    chartWithTwoAttributesAndSomeNullDatapoints,
} from "../test_data/fixtures";
import { HeaderPredicateFactory, IChartConfig, VisualizationTypes } from "../../src";
import { oneNegativeSideDataset } from "../test_data/chart_with_2_metrics_and_view_by_attribute";

const renderSupportedCharts = (
    config: IChartConfig = {},
    dataSet = barChartWith4MetricsAndViewBy2Attribute,
) => (
    <div>
        {[VisualizationTypes.COLUMN, VisualizationTypes.BAR].map(type => {
            const newConfig: IChartConfig = {
                type,
                legend: {
                    enabled: true,
                    position: "top",
                },
                ...config,
            };
            const style = {
                height: 600,
                width: 600,
            };

            if (type === VisualizationTypes.BAR) {
                newConfig.xaxis = config.yaxis;
                newConfig.yaxis = config.xaxis;
                newConfig.secondary_xaxis = config.secondary_yaxis;
                newConfig.dataLabels = {
                    visible: false, // disable data label on bar chart to make test stable
                };
            }

            return wrap(
                <div style={style}>
                    <Visualization config={newConfig} {...dataSet} />
                </div>,
                610,
                610,
            );
        })}
    </div>
);

const DUAL_AXIS_CONFIG = {
    secondary_yaxis: {
        measures: ["3b4fc6113ff9452da677ef7842e2302c", "26843260d95c4c9fa0aecc996ffd7829"],
    },
};

storiesOf("Internal/OptionalStacking/Column, Bar, DualAxis Chart", module)
    .add("Charts with viewBy 2 attributes", () => {
        return screenshotWrap(<div>{renderSupportedCharts()}</div>);
    })
    .add("Charts with viewBy 2 attributes and 60 degree label rotation", () => {
        const config = {
            xaxis: {
                rotation: "60",
            },
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Charts with viewBy 2 attributes and 'Stack Measures' enabled", () => {
        const config = {
            stackMeasures: true,
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Charts with viewBy 2 attributes and 'Stack Measures' enabled with min/max setting", () => {
        const config = {
            stackMeasures: true,
            yaxis: {
                min: "50000",
                max: "100000",
            },
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Charts with viewBy 2 attributes and 'Stack to 100%' enabled", () => {
        const config = {
            stackMeasuresToPercent: true,
            dataLabels: { visible: false },
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Charts with viewBy 2 attributes and 'Stack to 100%' enabled and dataLabels enabled", () => {
        const config = {
            stackMeasuresToPercent: true,
            dataLabels: {
                visible: true,
            },
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Charts with viewBy 2 attributes and 'Stack to 100%' enabled with min/max setting", () => {
        const config = {
            stackMeasuresToPercent: true,
            dataLabels: { visible: false },
            yaxis: {
                min: "0.2",
                max: "0.8",
            },
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Dual axis charts with viewBy 2 attributes", () => {
        return screenshotWrap(<div>{renderSupportedCharts(DUAL_AXIS_CONFIG)}</div>);
    })
    .add("Dual axis charts with viewBy 2 attributes and 60 degree label rotation", () => {
        const config = {
            xaxis: {
                rotation: "60",
            },
            ...DUAL_AXIS_CONFIG,
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Dual axis charts with viewBy 2 attributes and 'Stack Measures' enabled", () => {
        const config = {
            stackMeasures: true,
            ...DUAL_AXIS_CONFIG,
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add(
        "Dual axis charts with viewBy 2 attributes and 'Stack Measures' enabled with min/max setting",
        () => {
            const config = {
                stackMeasures: true,
                yaxis: {
                    min: "20000",
                    max: "80000",
                },
                secondary_yaxis: {
                    min: "10000",
                    max: "70000",
                    ...DUAL_AXIS_CONFIG.secondary_yaxis,
                },
            };
            return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
        },
    )
    .add("Dual axis charts with viewBy 2 attributes and 'Stack to 100%' enabled", () => {
        const config = {
            stackMeasuresToPercent: true,
            ...DUAL_AXIS_CONFIG,
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add(
        "Dual axis charts with viewBy 2 attributes and 'Stack to 100%' enabled and dataLabels enabled",
        () => {
            const config = {
                stackMeasuresToPercent: true,
                dataLabels: {
                    visible: true,
                },
                ...DUAL_AXIS_CONFIG,
            };
            return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
        },
    )
    .add("Dual axis charts with viewBy 2 attributes and 'Stack to 100%' enabled with min/max setting", () => {
        const config = {
            stackMeasuresToPercent: true,
            yaxis: {
                min: "0.2",
                max: "0.8",
            },
            secondary_yaxis: {
                min: "10000",
                max: "70000",
                ...DUAL_AXIS_CONFIG.secondary_yaxis,
            },
        };
        return screenshotWrap(<div>{renderSupportedCharts(config)}</div>);
    })
    .add("Column chart with viewBy 2 attributes and some null data points", () => {
        return screenshotWrap(
            // sd-313
            wrap(
                <Visualization
                    {...chartWithTwoAttributesAndSomeNullDatapoints}
                    drillableItems={[
                        HeaderPredicateFactory.uriMatch(
                            "/gdc/md/jroecoqa7jywstxy1hxp8lwl2c4nc10t/obj/1095/elements?id=966643",
                        ),
                    ]}
                    config={{
                        type: "column",
                        legend: {
                            position: "top",
                        },
                    }}
                />,
                400,
                "100%",
            ),
        );
    })
    .add('Column chart with stack label is disable with "Stack to 100%" on and some negative data', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...oneNegativeSideDataset}
                    config={{
                        type: "column",
                        legend: {
                            position: "top",
                        },
                        stackMeasuresToPercent: true,
                    }}
                />,
            ),
        );
    })
    // tslint:disable-next-line max-line-length
    .add(
        'Column chart with top and bottom stack label is enabled with "Stack measures" on and some negative data',
        () => {
            return screenshotWrap(
                wrap(
                    <Visualization
                        {...oneNegativeSideDataset}
                        config={{
                            type: "column",
                            legend: {
                                position: "top",
                            },
                            stackMeasures: true,
                        }}
                    />,
                ),
            );
        },
    )
    .add(
        "Dual axis charts with viewBy 2 attributes and 'Stack to 100%' enabled and some null data points",
        () => {
            const config = {
                stackMeasuresToPercent: true,
                ...DUAL_AXIS_CONFIG,
            };
            return screenshotWrap(
                <div>
                    {renderSupportedCharts(
                        config,
                        barChartWith4MetricsAndViewBy2AttributeAndSomeNullDataPoint,
                    )}
                </div>,
            );
        },
    );
