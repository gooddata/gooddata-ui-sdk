// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';

import ChartTransformation from '../../src/components/visualizations/chart/ChartTransformation';
import { FLUID_LEGEND_THRESHOLD } from '../../src/components/visualizations/chart/HighChartsRenderer';
import { immutableSet } from '../../src/components/visualizations/utils/common';
import { STACK_BY_DIMENSION_INDEX, VIEW_BY_DIMENSION_INDEX } from '../../src/components/visualizations/chart/constants';

import fixtureDataSets, * as fixtures from '../test_data/fixtures';

import { wrap } from '../utils/wrap';
import CustomLegend from '../utils/CustomLegend';

import '../../styles/scss/charts.scss';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import identity = require('lodash/identity');

function getChart({
    type = 'column',
    legendEnabled = true,
    legendPosition = 'top',
    legendResponsive = false,
    dataSet = fixtures.barChartWithoutAttributes,
    colorPalette,
    width,
    height,
    minHeight,
    minWidth,
    chartHeight,
    chartWidth,
    key,
    secondary_xaxis = {},
    secondary_yaxis = {}
}: any) {
    return wrap((
        <ChartTransformation
            config={{
                type,
                legend: {
                    enabled: legendEnabled,
                    position: legendPosition,
                    responsive: legendResponsive
                },
                colorPalette,
                secondary_xaxis,
                secondary_yaxis
            }}
            height={chartHeight}
            width={chartWidth}
            {...dataSet}
            onDataTooLarge={identity}
        />
    ), height, width, minHeight, minWidth, key);
}

class DynamicChart extends React.Component<any, any> {
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
            'heatmap'
        ];

        this.state = {
            chartType: 'column',
            dataSet: this.fixtures.barChartWith3MetricsAndViewByAttribute,
            legendOption: this.legendOptions['legend top']
        };
    }

    public setDataSet(dataSetName: any) {
        this.setState({
            dataSet: this.fixtures[dataSetName]
        });
    }

    public setLegend(legendOption: any) {
        this.setState({
            legendOption: this.legendOptions[legendOption]
        });
    }

    public setChartType(chartType: any) {
        this.setState({
            chartType
        });
    }

    public render() {
        const { dataSet, legendOption, chartType } = this.state;

        const setDataSet = (dataSetName: any) => (() => this.setDataSet(dataSetName));
        const setLegend = (legendOptionsItem: any) => (() => this.setLegend(legendOptionsItem));
        const setChartType = (chartTypeOption: any) => (() => this.setChartType(chartTypeOption));
        return (
            <div>
                <div>
                    {screenshotWrap(wrap(<ChartTransformation
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
                        <button key={dataSetName} onClick={setDataSet(dataSetName)} >{dataSetName}</button>
                    )) }
                </div>
                <div>
                    { Object.keys(this.legendOptions).map(legendOptionsItem => (
                        <button key={legendOptionsItem} onClick={setLegend(legendOptionsItem)} >
                            {legendOptionsItem}
                        </button>
                    )) }
                </div>
                <div>
                    { this.chartTypes.map((chartTypeOption: any) => (
                        <button key={chartTypeOption} onClick={setChartType(chartTypeOption)} >
                            {chartTypeOption}
                        </button>
                    )) }
                </div>
            </div>
        );
    }
}

storiesOf('Internal/HighCharts/ChartTransformation', module)
    .add('Bubble chart with three measures and one attribute', () => {
        const dataSet = {
            ...fixtures.bubbleChartWith3MetricsAndAttribute
        };
        const dataLarge = () => { throw new Error('Data too large'); };

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[]}
                    config={{
                        type: 'bubble',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette,
                        mdObject: fixtures.bubbleChartWith3MetricsAndAttributeMd.mdObject
                    }}
                    {...dataSet}
                    onDataTooLarge={dataLarge}
                    onNegativeValues={null}
                />
            )
        );
    })
    .add('Scatterplot with two measures and one attribute', () => {
        const dataSet = {
            ...fixtures.scatterPlotWith2MetricsAndAttribute
        };
        const dataLarge = () => { throw new Error('Data too large'); };

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[1]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'scatter',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette,
                        mdObject: dataSet.mdObject
                    }}
                    {...dataSet}
                    onDataTooLarge={dataLarge}
                    onNegativeValues={null}
                />
            )
        );
    })
    .add('Column chart with one measure and no attributes', () => {
        const dataSet = {
            ...fixtures.barChartWithSingleMeasureAndNoAttributes
        };
        const dataLarge = () => { throw new Error('Data too large'); };
        const negativePieChart = () => { throw new Error('Negative values in pie chart'); };

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={dataLarge}
                    onNegativeValues={negativePieChart}
                />
            )
        );
    })
    .add('Column chart without attributes', () => {
        const dataSet = fixtures.barChartWithoutAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[0].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with 3 metrics and view by attribute', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with 18 measures and view by attribute', () => {
        const dataSet = fixtures.barChartWith18MetricsAndViewByAttribute;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with view by attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse
                                .dimensions[VIEW_BY_DIMENSION_INDEX].headers[0].attributeHeader.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with viewBy and stackBy attribute', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with viewBy and stackBy attribute but only one stack item', () => {
        const dataSet = fixtures.barChartWithStackByAndOnlyOneStack;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with 6 pop measures and view by attribute', () => {
        const dataSet = fixtures.barChartWith6PopMeasuresAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart with 6 previous period measures', () => {
        const dataSet = fixtures.barChartWith6PreviousPeriodMeasures;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Bar chart with viewBy and stackBy attribute', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[STACK_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'bar',
                        legend: {
                            enabled: true,
                            position: 'bottom'
                        },
                        legendLayout: 'vertical',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Line chart with viewBy and stackBy attribute', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'line',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Pie chart view viewBy attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Pie chart with measures only', () => {
        const dataSet = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[VIEW_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Pie chart view viewBy attribute with empty value', () => {
        const dataSet: any = immutableSet(fixtures.barChartWithViewByAttribute, 'executionResult.data[0][0]', null);

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'pie',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Funnel chart view viewBy attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'funnel',
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Funnel chart with measures only', () => {
        const dataSet = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[VIEW_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'funnel',
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Funnel chart view viewBy attribute with empty value', () => {
        const dataSet: any = immutableSet(fixtures.barChartWithViewByAttribute, 'executionResult.data[0][0]', null);

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'funnel',
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Treemap with viewBy attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'treemap',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Treemap with measures only', () => {
        const dataSet = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(wrap(
            <ChartTransformation
                drillableItems={[{
                    uri: dataSet.executionResponse.dimensions[VIEW_BY_DIMENSION_INDEX]
                        .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                }]}
                config={{
                    type: 'treemap',
                    colorPalette: fixtures.customPalette
                }}
                {...dataSet}
                onDataTooLarge={identity}
            />
            )
        );
    })
    .add('Treemap with viewBy attribute with empty value', () => {
        const dataSet: any = immutableSet(fixtures.barChartWithViewByAttribute, 'executionResult.data[0][0]', null);

        return screenshotWrap(wrap(
            <ChartTransformation
                drillableItems={[{
                    uri: dataSet.executionResult
                        .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                }]}
                config={{
                    type: 'treemap',
                    colorPalette: fixtures.customPalette
                }}
                {...dataSet}
                onDataTooLarge={identity}
            />
            )
        );
    })
    .add('Donut chart view viewBy attribute', () => {
        const dataSet = fixtures.barChartWithViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'donut',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Donut chart with measures only', () => {
        const dataSet = fixtures.pieChartWithMetricsOnly;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[VIEW_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'donut',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Donut chart view viewBy attribute with empty value', () => {
        const dataSet: any = immutableSet(fixtures.barChartWithViewByAttribute, 'executionResult.data[0][0]', null);

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'donut',
                        legend: {
                            enabled: true,
                            position: 'left'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Combo chart with one metric on each chart', () => {
        const dataSet: any = fixtures.comboWithTwoMeasuresAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: 'combo',
                        mdObject: fixtures.comboWithTwoMeasuresAndViewByAttributeMdObject
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][4].attributeHeaderItem.uri
                        }
                    ]}
                />
            )
        );
    })
    .add('Heatmap with one metric and two attributes', () => {
        const dataSet: any = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'heatmap'
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Legend positions', () => {
        return screenshotWrap(
            <div>
                {getChart({
                    legendPosition: 'top',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
                {getChart({
                    legendPosition: 'bottom',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
                {getChart({
                    legendPosition: 'left',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
                {getChart({
                    legendPosition: 'right',
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute
                })}
            </div>
        );
    })
    .add('Legend right with paging', () => (
        screenshotWrap(
            getChart({
                legendPosition: 'right',
                dataSet: fixtures.barChartWith60MetricsAndViewByAttribute
            })
        )
    ))
    .add('Legend with mobile paging', () => (
        <div>
            Resize window to {FLUID_LEGEND_THRESHOLD}px or less
            {screenshotWrap(
                getChart({
                    legendPosition: 'right',
                    legendResponsive: true,
                    dataSet: fixtures.barChartWith60MetricsAndViewByAttribute,
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    chartHeight: 300
                })
            )}
        </div>
    ))
    .add('Custom color palette', () => (
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                colorPalette: [{
                    guid: 'black',
                    fill: {
                        r: 0, g: 0, b: 0
                    }
                }, {
                    guid: 'red',
                    fill: {
                        r: 255, g: 0, b: 0
                    }
                }]
            })
        )
    ))
    .add('Responsive width', () => (
        screenshotWrap(
            [
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'top',
                    width: '100%',
                    key: 'top'
                }),
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'bottom',
                    width: '100%',
                    key: 'bottom'
                }),
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'left',
                    width: '100%',
                    key: 'left'
                }),
                getChart({
                    dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                    legendPosition: 'right',
                    width: '100%',
                    key: 'right'
                })
            ]
        )
    ))
    .add('Fill parent without legend', () => (
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                legendEnabled: false,
                height: 500,
                width: '100%'
            })
        )
    ))
    .add('Negative and zero values', () => (
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWithNegativeAndZeroValues,
                height: 500,
                width: '100%'
            })
        )
    ))
    .add('Custom legend implementation', () => (
        <CustomLegend />
    ))
    .add('Dynamic Chart test', () => (
        <DynamicChart />
    ))
    .add('ChartTransformation with viewBy and stackBy attribute and German number format', () => {
        const dataSet = fixtures.barChartWithStackByAndViewByAttributes;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResult
                                .headerItems[VIEW_BY_DIMENSION_INDEX][0][0].attributeHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'vertical',
                        colorPalette: fixtures.customPalette,
                        ...GERMAN_SEPARATORS
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Dual axes with two left measures, one right measure, one attribute', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            measures: ['expectedMetric']
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Right axis with three right measures, one attribute', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[
                        {
                            uri: dataSet.executionResponse.dimensions[STACK_BY_DIMENSION_INDEX]
                                .headers[0].measureGroupHeader.items[1].measureHeaderItem.uri
                        }
                    ]}
                    config={{
                        type: 'column',
                        legend: {
                            enabled: true,
                            position: 'top'
                        },
                        legendLayout: 'horizontal',
                        colorPalette: fixtures.customPalette,
                        secondary_yaxis: {
                            measures: ['lostMetric', 'wonMetric', 'expectedMetric']
                        }
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Dual axes with legend positions', () => (
        screenshotWrap(
            <div>
                {getChart({
                    legendPosition: 'top',
                    dataSet: fixtures.chartWith20MetricsAndViewByAttribute,
                    secondary_yaxis: {
                        measures: fixtures.metricsInSecondaryAxis
                    }
                })}
                {getChart({
                    legendPosition: 'right',
                    dataSet: fixtures.chartWith20MetricsAndViewByAttribute,
                    secondary_yaxis: {
                        measures: fixtures.metricsInSecondaryAxis
                    }
                })}
                {getChart({
                    legendPosition: 'bottom',
                    dataSet: fixtures.chartWith20MetricsAndViewByAttribute,
                    secondary_yaxis: {
                        measures: fixtures.metricsInSecondaryAxis
                    }
                })}
                {getChart({
                    legendPosition: 'left',
                    dataSet: fixtures.chartWith20MetricsAndViewByAttribute,
                    secondary_yaxis: {
                        measures: fixtures.metricsInSecondaryAxis
                    }
                })}

            </div>
        )
    ))
    .add('Dual axes with mobile paging legend', () => (
        <div>
            Resize window to {FLUID_LEGEND_THRESHOLD}px or less
            {screenshotWrap(
                getChart({
                    legendPosition: 'right',
                    legendResponsive: true,
                    dataSet: fixtures.chartWith20MetricsAndViewByAttribute,
                    width: '100%',
                    height: '100%',
                    minHeight: 300,
                    chartHeight: 300,
                    secondary_yaxis: {
                        measures: fixtures.metricsInSecondaryAxis
                    }
                })
            )}
        </div>
    ))
    .add('Optional stacking chart', () => {
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: 'column'
                    }}
                    {...fixtures.barChartWith4MetricsAndViewBy2Attribute}
                />
            )
        );
    })
    .add('Optional stacking and dual axis chart', () => {
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: 'column',
                        secondary_yaxis: {
                            measures: ['3b4fc6113ff9452da677ef7842e2302c', '26843260d95c4c9fa0aecc996ffd7829']
                        }
                    }}
                    {...fixtures.barChartWith4MetricsAndViewBy2Attribute}
                />
            )
        );
    })
    .add('Optional stacking and dual axis chart with stack config', () => {
        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: 'column',
                        stackMeasuresToPercent: true,
                        secondary_yaxis: {
                            measures: ['3b4fc6113ff9452da677ef7842e2302c', '26843260d95c4c9fa0aecc996ffd7829']
                        }
                    }}
                    {...fixtures.barChartWith4MetricsAndViewBy2Attribute}
                />
            )
        );
    });
