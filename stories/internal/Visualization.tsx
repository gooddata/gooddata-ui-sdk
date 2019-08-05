// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import noop = require("lodash/noop");
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { screenshotWrap } from "@gooddata/test-storybook";

import { Visualization } from "../../src/components/visualizations/Visualization";
import fixtureDataSets, * as fixtures from "../test_data/fixtures";
import { wrap } from "../utils/wrap";
import { immutableSet } from "../../src/components/visualizations/utils/common";

import "../../styles/scss/charts.scss";
import { GERMAN_NUMBER_FORMAT } from "../data/numberFormat";
import { VisualizationTypes } from "../../src";

export interface IDynamicVisualizationState {
    chartType: string;
    dataSet: any;
    legendOption: any;
}

class DynamicVisualization extends React.Component<{}, IDynamicVisualizationState> {
    private fixtures: any;
    private legendOptions: any;
    private chartTypes: any;

    constructor(props: any) {
        super(props);
        this.fixtures = {
            ...fixtureDataSets,
            updatedBarChartWith3MetricsAndViewByAttribute: (dataSet =>
                immutableSet(
                    dataSet,
                    "executionResult.data[1]",
                    dataSet.executionResult.data[1].map((pointValue: any) => pointValue * 2),
                ))(fixtures.barChartWith3MetricsAndViewByAttribute),
        };

        this.legendOptions = {
            "no legend": { enabled: false },
            "legend top": { enabled: true, position: "top" },
            "legend right": { enabled: true, position: "right" },
            "legend bottom": { enabled: true, position: "bottom" },
            "legend left": { enabled: true, position: "left" },
        };

        this.chartTypes = [
            VisualizationTypes.COLUMN,
            VisualizationTypes.BAR,
            VisualizationTypes.LINE,
            VisualizationTypes.PIE,
            VisualizationTypes.AREA,
            VisualizationTypes.HEATMAP,
        ];

        this.state = {
            chartType: VisualizationTypes.COLUMN,
            dataSet: this.fixtures.barChartWith3MetricsAndViewByAttribute,
            legendOption: this.legendOptions["legend top"],
        };
    }

    public render() {
        const { dataSet, legendOption, chartType } = this.state;
        return (
            <div>
                <div>
                    {screenshotWrap(
                        wrap(
                            <Visualization
                                config={{
                                    type: chartType,
                                    legend: legendOption,
                                }}
                                {...dataSet}
                                onDataTooLarge={action("Data too large")}
                                onNegativeValues={action("Negative values in pie chart")}
                            />,
                            600,
                        ),
                    )}
                </div>
                <br />
                <div>
                    {Object.keys(this.fixtures).map(dataSetName => (
                        <button key={dataSetName} onClick={this.setDataSetFn(dataSetName)}>
                            {dataSetName}
                        </button>
                    ))}
                </div>
                <div>
                    {Object.keys(this.legendOptions).map(legendOptionsItem => (
                        <button key={legendOptionsItem} onClick={this.setLegendFn(legendOptionsItem)}>
                            {legendOptionsItem}
                        </button>
                    ))}
                </div>
                <div>
                    {this.chartTypes.map((chartTypeOption: any) => (
                        <button key={chartTypeOption} onClick={this.setChartTypeFn(chartTypeOption)}>
                            {chartTypeOption}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    private setDataSetFn(dataSetName: any) {
        return () => this.setDataSet(dataSetName);
    }

    private setLegendFn(legendOptionsItem: any) {
        return () => this.setLegend(legendOptionsItem);
    }

    private setChartTypeFn(chartTypeOption: any) {
        return () => this.setChartType(chartTypeOption);
    }

    private setDataSet(dataSetName: any) {
        this.setState({
            dataSet: this.fixtures[dataSetName],
        });
    }

    private setLegend(legendOption: any) {
        this.setState({
            legendOption: this.legendOptions[legendOption],
        });
    }

    private setChartType(chartType: any) {
        this.setState({
            chartType,
        });
    }
}

storiesOf("Internal/Visualization", module)
    .add("visualization bar chart without attributes", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithoutAttributes}
                    config={{
                        type: VisualizationTypes.BAR,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization column chart with 3 metrics and view by attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COLUMN,
                        legend: {
                            position: "top",
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization bar chart with 3 metrics and view by attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.BAR,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization bar chart with view by attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithViewByAttribute}
                    config={{
                        type: VisualizationTypes.BAR,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization bar chart with stack by and view by attributes", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithStackByAndViewByAttributes}
                    config={{
                        type: VisualizationTypes.BAR,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization bar chart with pop measure and view by attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithPopMeasureAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.BAR,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization bar chart with previous period measure and view by attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithPreviousPeriodMeasure}
                    config={{
                        type: VisualizationTypes.BAR,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization pie chart with metrics only", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.pieChartWithMetricsOnly}
                    config={{
                        type: VisualizationTypes.PIE,
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization stacked area chart", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.AREA,
                        legend: {
                            position: "right",
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization area chart with disabled stacking", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.AREA,
                        stacking: false,
                        legend: {
                            position: "top",
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })

    .add("visualization stacked area chart with single measure and no attributes", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithSingleMeasureAndNoAttributes}
                    config={{
                        type: VisualizationTypes.AREA,
                        legend: {
                            position: "top",
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })

    .add("visualization stacked area chart with negative values", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWithNegativeValues}
                    config={{
                        type: VisualizationTypes.AREA,
                        legend: {
                            position: "bottom",
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })

    .add("visualization stacked area chart with single metric and stack by attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWith1MetricsAndStackByAttributeAndFilters}
                    config={{
                        type: VisualizationTypes.AREA,
                        legend: {
                            position: "bottom",
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("dynamic visualization", () => {
        return <DynamicVisualization />;
    })
    .add("visualization with German number format", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COLUMN,
                        separators: GERMAN_NUMBER_FORMAT,
                        dataLabels: {
                            visible: true,
                        },
                    }}
                    onDataTooLarge={noop}
                />,
                600,
                800,
            ),
        );
    })
    .add("visualization dual axes with two left measures, one right measure, one attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COLUMN,
                        legend: {
                            position: "top",
                        },
                        secondary_yaxis: {
                            measures: ["expectedMetric"],
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization right axis with three right measures, one attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COLUMN,
                        legend: {
                            position: "top",
                        },
                        secondary_yaxis: {
                            rotation: "45",
                            measures: ["lostMetric", "wonMetric", "expectedMetric"],
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization combo chart with 2 measures, one attribute", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.comboWithTwoMeasuresAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COMBO,
                        mdObject: fixtures.comboWithTwoMeasuresAndViewByAttributeMdObject,
                        secondary_yaxis: {
                            measures: ["wonMetric"],
                        },
                    }}
                    onDataTooLarge={noop}
                />,
            ),
        );
    })
    .add("visualization combo chart with stacking configuration", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.comboWithThreeMeasuresAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COMBO2,
                        mdObject: fixtures.comboWithThreeMeasuresAndViewByAttributeMdObject,
                        secondary_yaxis: {
                            measures: ["expectedMetric"],
                        },
                        stackMeasures: true,
                    }}
                    onDataTooLarge={noop}
                />,
                800,
                1200,
            ),
        );
    })
    .add("visualization combo chart with secondary_yaxis point to primary measure", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.comboWithThreeMeasuresAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COMBO2,
                        mdObject: fixtures.comboWithThreeMeasuresAndViewByAttributeMdObject,
                        secondary_yaxis: {
                            measures: ["lostMetric"],
                        },
                    }}
                    onDataTooLarge={noop}
                />,
                600,
                800,
            ),
        );
    })
    .add(
        "visualization combo chart with dualAxis is false and secondary_yaxis point to primary measure",
        () => {
            return screenshotWrap(
                wrap(
                    <Visualization
                        {...fixtures.comboWithThreeMeasuresAndViewByAttribute}
                        config={{
                            type: VisualizationTypes.COMBO2,
                            mdObject: fixtures.comboWithThreeMeasuresAndViewByAttributeMdObject,
                            dualAxis: false,
                            secondary_yaxis: {
                                measures: ["wonMetric"],
                            },
                        }}
                        onDataTooLarge={noop}
                    />,
                    600,
                    800,
                ),
            );
        },
    )
    .add("visualization combo chart with dualAxis is true and secondary_yaxis point to measure", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.comboWithThreeMeasuresAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COMBO2,
                        mdObject: fixtures.comboWithThreeMeasuresAndViewByAttributeMdObject,
                        secondary_yaxis: {
                            measures: ["wonMetric"],
                        },
                        dualAxis: true,
                    }}
                    onDataTooLarge={noop}
                />,
                600,
                800,
            ),
        );
    })
    .add("visualization combo chart with dualAxis is true and do not set param secondary_yaxis", () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.comboWithThreeMeasuresAndViewByAttribute}
                    config={{
                        type: VisualizationTypes.COMBO2,
                        mdObject: fixtures.comboWithThreeMeasuresAndViewByAttributeMdObject,
                        dualAxis: true,
                    }}
                    onDataTooLarge={noop}
                />,
                600,
                800,
            ),
        );
    });
