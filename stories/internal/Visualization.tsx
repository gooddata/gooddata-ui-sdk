// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import noop = require('lodash/noop');
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Visualization } from '../../src/components/visualizations/Visualization';
import fixtureDataSets, * as fixtures from '../test_data/fixtures';
import { wrap } from '../utils/wrap';
import { immutableSet } from '../../src/components/visualizations/utils/common';

import '../../styles/scss/charts.scss';

export interface IDynamicVisualizationState {
    chartType: string;
    dataSet: any;
    legendOption: any;
}

class DynamicVisualization extends React.Component<null, IDynamicVisualizationState> {
    private fixtures: any;
    private legendOptions: any;
    private chartTypes: any;

    constructor(props: any) {
        super(props);
        this.fixtures = {
            ...fixtureDataSets,
            updatedBarChartWith3MetricsAndViewByAttribute: (dataSet => immutableSet(
                dataSet,
                'executionResult.data[1]',
                dataSet.executionResult.data[1].map((pointValue: any) => pointValue * 2)
            ))(fixtures.barChartWith3MetricsAndViewByAttribute)
        };

        this.legendOptions = {
            'no legend': { enabled: false },
            'legend top': { enabled: true, position: 'top' },
            'legend right': { enabled: true, position: 'right' },
            'legend bottom': { enabled: true, position: 'bottom' },
            'legend left': { enabled: true, position: 'left' }
        };

        this.chartTypes = [
            'column',
            'bar',
            'line',
            'pie',
            'area'
        ];

        this.state = {
            chartType: 'column',
            dataSet: this.fixtures.barChartWith3MetricsAndViewByAttribute,
            legendOption: this.legendOptions['legend top']
        };
    }

    public render() {
        const { dataSet, legendOption, chartType } = this.state;
        return (
            <div>
                <div>
                    {screenshotWrap(wrap(<Visualization
                        config={{
                            type: chartType,
                            legend: legendOption
                        }}
                        {...dataSet}
                        onDataTooLarge={action('Data too large')}
                        onNegativeValues={action('Negative values in pie chart')}
                    />, 600))}
                </div>
                <br />
                <div>
                    { Object.keys(this.fixtures).map(dataSetName => (
                        <button key={dataSetName} onClick={this.setDataSetFn(dataSetName)} >{dataSetName}</button>
                    )) }
                </div>
                <div>
                    { Object.keys(this.legendOptions).map(legendOptionsItem => (
                        <button key={legendOptionsItem} onClick={this.setLegendFn(legendOptionsItem)} >
                            {legendOptionsItem}
                        </button>
                    )) }
                </div>
                <div>
                    { this.chartTypes.map((chartTypeOption: any) => (
                        <button key={chartTypeOption} onClick={this.setChartTypeFn(chartTypeOption)} >
                            {chartTypeOption}
                        </button>
                    )) }
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
            dataSet: this.fixtures[dataSetName]
        });
    }

    private setLegend(legendOption: any) {
        this.setState({
            legendOption: this.legendOptions[legendOption]
        });
    }

    private setChartType(chartType: any) {
        this.setState({
            chartType
        });
    }
}

storiesOf('Internal/Visualization', module)
    .add('visualization bar chart without attributes', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithoutAttributes}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization column chart with 3 metrics and view by attribute', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: 'column',
                        legend: {
                            position: 'top'
                        }
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization bar chart with 3 metrics and view by attribute', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization bar chart with view by attribute', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithViewByAttribute}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization bar chart with stack by and view by attributes', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithStackByAndViewByAttributes}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization bar chart with pop measure and view by attribute', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithPopMeasureAndViewByAttribute}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization bar chart with previous period measure and view by attribute', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithPreviousPeriodMeasure}
                    config={{
                        type: 'bar'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization pie chart with metrics only', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.pieChartWithMetricsOnly}
                    config={{
                        type: 'pie'
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization stacked area chart', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: 'area',
                        legend: {
                            position: 'right'
                        }
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('visualization area chart with disabled stacking', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWith3MetricsAndViewByAttribute}
                    config={{
                        type: 'area',
                        stacking: false,
                        legend: {
                            position: 'top'
                        }
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })

    .add('visualization stacked area chart with single measure and no attributes', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.barChartWithSingleMeasureAndNoAttributes}
                    config={{
                        type: 'area',
                        legend: {
                            position: 'top'
                        }
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })

    .add('visualization stacked area chart with negative values', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWithNegativeValues}
                    config={{
                        type: 'area',
                        legend: {
                            position: 'bottom'
                        }
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })

    .add('visualization stacked area chart with single metric and stack by attribute', () => {
        return screenshotWrap(
            wrap(
                <Visualization
                    {...fixtures.areaChartWith1MetricsAndStackByAttributeAndFilters}
                    config={{
                        type: 'area',
                        legend: {
                            position: 'bottom'
                        }
                    }}
                    onDataTooLarge={noop}
                />
            )
        );
    })
    .add('dynamic visualization', () => {
        return <DynamicVisualization />;
    });
