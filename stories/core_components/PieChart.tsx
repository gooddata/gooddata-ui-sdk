// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { IChartConfig, PieChart } from '../../src';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
    ARITHMETIC_MEASURE_USING_ARITHMETIC
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';
import {
    DATA_LABELS_VISIBLE_CONFIG,
    DATA_LABELS_HIDDEN_CONFIG,
    DATA_LABELS_AUTO_CONFIG,
    CUSTOM_COLOR_PALETTE_CONFIG
} from '../data/configProps';
import { attributeItemNameMatch } from '../../src/factory/HeaderPredicateFactory';
import { RGBType } from '@gooddata/gooddata-js';
import { VisualizationObject } from '@gooddata/typings';
import { PositionType } from '../../src/components/visualizations/typings/legend';

const wrapperStyle = { width: 400, height: 400 };

function createPieChartWithConfig(customProps?: {
    config?: IChartConfig
    measures?: VisualizationObject.BucketItem[],
    viewBy?: VisualizationObject.IVisualizationAttribute
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
            position
        }
    };
}

storiesOf('Core components/PieChart', module)
    .add('two measures', () => (
        screenshotWrap(
            createPieChartWithConfig({
                measures: [MEASURE_1, MEASURE_2],
                viewBy: null
            })
        )
    ))
    .add('measure and attribute', () => (
        screenshotWrap(
            createPieChartWithConfig()
        )
    ))
    .add('one measure with alias, one attribute with alias', () => (
        screenshotWrap(
            createPieChartWithConfig({
                measures: [MEASURE_1_WITH_ALIAS],
                viewBy: ATTRIBUTE_1_WITH_ALIAS
            })
        )
    ))
    .add('with German number format in tooltip', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: GERMAN_SEPARATORS
            })
        )
    ))
    .add('with disabled legend', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: {
                    legend: {
                        enabled: false
                    }
                }
            })
        )
    ))
    .add('arithmetic measures', () => (
        screenshotWrap(
            createPieChartWithConfig({
                measures: [
                    MEASURE_1,
                    MEASURE_2,
                    ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                    ARITHMETIC_MEASURE_USING_ARITHMETIC
                ],
                viewBy: null
            })
        )
    ))
    .add('measure and attribute with custom colors', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: {
                    ...CUSTOM_COLOR_PALETTE_CONFIG
                }
            })
        )
    ))
    .add('measure and attribute with color mapping', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: {
                    ...CUSTOM_COLOR_PALETTE_CONFIG,
                    colorMapping: [
                        {
                            predicate: attributeItemNameMatch('Red'),
                            color: {
                                type: 'guid',
                                value: '03'
                            }
                        }, {
                            predicate: attributeItemNameMatch('Purple'),
                            color: {
                                type: 'guid',
                                value: '02'
                            }
                        }, {
                            predicate: attributeItemNameMatch('Pink'),
                            color: {
                                type: 'rgb' as RGBType,
                                value: {
                                    r: 0,
                                    g: 0,
                                    b: 0
                                }
                            }
                        }
                    ]
                }
            })
        )
    ))
    .add('measure and attribute with invalid color assignment', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: {
                    ...CUSTOM_COLOR_PALETTE_CONFIG,
                    colorMapping: [
                        {
                            predicate: attributeItemNameMatch('Red'),
                            color: {
                                type: 'guid',
                                value: 'xx'
                            }
                        }, {
                            predicate: attributeItemNameMatch('Purple'),
                            color: {
                                type: 'guid',
                                value: 'xxx'
                            }
                        }, {
                            predicate: attributeItemNameMatch('Pink'),
                            color: {
                                type: 'rgb' as RGBType,
                                value: {
                                    r: 0,
                                    g: 0,
                                    b: 0
                                }
                            }
                        }
                    ]
                }
            })
        )
    ));

storiesOf('Core components/PieChart/with different legend positions', module)
    .add('auto (default)', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: createLegendConfig('auto')
            })
        )
    ))
    .add('left', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: createLegendConfig('left')
            })
        )
    ))
    .add('top', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: createLegendConfig('top')
            })
        )
    ))
    .add('right', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: createLegendConfig('right')
            })
        )
    ))
    .add('bottom', () => (
        screenshotWrap(
            createPieChartWithConfig({
                config: createLegendConfig('bottom')
            })
        )
    ));

storiesOf('Core components/PieChart/data labels config', module)
    .add('hidden (default)', () => (
        screenshotWrap(
            createPieChartWithConfig({
                viewBy: ATTRIBUTE_3
            })
        )
    ))
    .add('auto', () => (
        screenshotWrap(
            createPieChartWithConfig({
                viewBy: ATTRIBUTE_3,
                config: DATA_LABELS_AUTO_CONFIG
            })
        )
    ))
    .add('show', () => (
        screenshotWrap(
            createPieChartWithConfig({
                viewBy: ATTRIBUTE_3,
                config: DATA_LABELS_VISIBLE_CONFIG
            })
        )
    ))
    .add('hidden', () => (
        screenshotWrap(
            createPieChartWithConfig({
                viewBy: ATTRIBUTE_3,
                config: DATA_LABELS_HIDDEN_CONFIG
            })
        )
    ));
