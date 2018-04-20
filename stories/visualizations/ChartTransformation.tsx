// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action, decorateAction } from '@storybook/addon-actions';
import { screenshotWrap } from '@gooddata/test-storybook';
import identity = require('lodash/identity');

import ChartTransformation from '../../src/components/visualizations/chart/ChartTransformation';
import { FLUID_LEGEND_THRESHOLD } from '../../src/components/visualizations/chart/legend/Legend';
import { immutableSet } from '../../src/components/visualizations/utils/common';
import { VIEW_BY_DIMENSION_INDEX, STACK_BY_DIMENSION_INDEX } from '../../src/components/visualizations/chart/constants';

import fixtureDataSets, * as fixtures from '../test_data/fixtures';

import { wrap } from '../utils/wrap';
import CustomLegend from '../utils/CustomLegend';

import '../../styles/scss/charts.scss';

const eventAction = decorateAction([firstArg => [firstArg[0].detail]]);
document.addEventListener('drill', eventAction('drill'));

function getChart({
    type = 'column',
    legendEnabled = true,
    legendPosition = 'top',
    legendResponsive = false,
    dataSet = fixtures.barChartWithoutAttributes,
    colors,
    width,
    height,
    minHeight,
    minWidth,
    chartHeight,
    chartWidth,
    key
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
                colors
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
            'pie'
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
    .add('Scatterplot with two measures and one attribute', () => {
        const dataSet = {
            ...fixtures.scatterPlotWith2MetricsAndAttribute
        };
        const dataLarge = () => { throw new Error('Data too large'); };

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    drillableItems={[]}
                    config={{
                        type: 'scatter',
                        legend: {
                            enabled: true,
                            position: 'right'
                        },
                        legendLayout: 'horizontal',
                        colors: fixtures.customPalette,
                        mdObject: fixtures.scatterPlotWith2MetricsAndAttributeMdObject.mdObject
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
                    }}
                    {...dataSet}
                    onDataTooLarge={identity}
                />
            )
        );
    })
    .add('Column chart without gridline', () => {
        const dataSet = fixtures.barChartWith3MetricsAndViewByAttribute;

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
                        colors: fixtures.customPalette,
                        grid: {
                            enabled: false
                        }
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                    colors: fixtures.customPalette
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
                    colors: fixtures.customPalette
                }}
                {...dataSet}
                onDataTooLarge={identity}
            />
            )
        );
    })
    .add('Dual axis line/line chart with one metric on each axis', () => {
        const dataSet: any = fixtures.barChartWith2MetricsAndViewByAttribute;

        return screenshotWrap(
            wrap(
                <ChartTransformation
                    config={{
                        type: 'dual',
                        mdObject: fixtures.barChartWith2MetricsAndViewByAttributeMd.mdObject
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
                        colors: fixtures.customPalette
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
    .add('Custom color pallete', () => (
        screenshotWrap(
            getChart({
                dataSet: fixtures.barChartWith3MetricsAndViewByAttribute,
                colors: [
                    '#000000',
                    '#ff0000'
                ]
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
    ));
