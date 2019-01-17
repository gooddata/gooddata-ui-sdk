// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { PieChart } from '../../src';
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

const wrapperStyle = { width: 400, height: 400 };

storiesOf('Core components/PieChart', module)
    .add('two measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('measure and attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('one measure with alias, one attribute with alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    viewBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with German number format in tooltip', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with disabled legend', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            enabled: false
                        }
                    }}
                />
            </div>
        )
    ))
    .add('with different legend positions', () => (
        screenshotWrap(
            <div>
            <div className="storybook-title">default = auto</div>
            <div style={wrapperStyle} className="screenshot-container">
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            position: 'auto'
                        }
                    }}
                />
            </div>
            <div className="storybook-title">left</div>
            <div style={wrapperStyle} className="screenshot-container">
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            position: 'left'
                        }
                    }}
                />
            </div>
            <div className="storybook-title">top</div>
            <div style={wrapperStyle} className="screenshot-container">
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            position: 'top'
                        }
                    }}
                />
            </div>
            <div className="storybook-title">right</div>
            <div style={wrapperStyle} className="screenshot-container">
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            position: 'right'
                        }
                    }}
                />
            </div>
            <div className="storybook-title">bottom</div>
            <div style={wrapperStyle} className="screenshot-container">
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        legend: {
                            position: 'bottom'
                        }
                    }}
                />
            </div>
        </div>
        )
    ))
    .add('data labels config', () => (
        screenshotWrap(
            <div>
                <div className="storybook-title">default = hidden</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <PieChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                    />
                </div>
                <div className="storybook-title">auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <PieChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_AUTO_CONFIG}
                    />
                </div>
                <div className="storybook-title">show</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <PieChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_VISIBLE_CONFIG}
                    />
                </div>
                <div className="storybook-title">hide</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <PieChart
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_3}
                        onError={onErrorHandler}
                        LoadingComponent={null}
                        ErrorComponent={null}
                        config={DATA_LABELS_HIDDEN_CONFIG}
                    />
                </div>
            </div>
        )
    ))
    .add('arithmetic measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[
                        MEASURE_1,
                        MEASURE_2,
                        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                        ARITHMETIC_MEASURE_USING_ARITHMETIC
                    ]}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('measure and attribute with custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
                        ...CUSTOM_COLOR_PALETTE_CONFIG
                    }}
                />
            </div>
        )
    ))
    .add('measure and attribute with color mapping', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
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
                    }}
                />
            </div>
        )
    )).add('measure and attribute with invalid color assignment', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{
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
                    }}
                />
            </div>
        )
    ));
