// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Treemap } from '../../src';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_2,
    ATTRIBUTE_3,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    MEASURE_3,
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
import { RGBType } from '../../src/interfaces/Config';
import { getAttributeItemNamePredicate } from '../../src/helpers/predicatesFactory';

const wrapperStyle = { width: 600, height: 300 };

storiesOf('Core components/Treemap', module)
    .add('two measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('measure and View By attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('measure, View By and Segment by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    segmentBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('measures and Segment by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2, MEASURE_3]}
                    segmentBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('renamed measure and renamed attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1_WITH_ALIAS]}
                    viewBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('all default colors', () => (
        screenshotWrap(
            <div style={{ width: 1900, height: 1200 }}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_3}
                    segmentBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                />
            </div>
        )
    )).add('custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={CUSTOM_COLOR_PALETTE_CONFIG}
                    onError={onErrorHandler}
                />
            </div>
        )
    )).add('custom colors and color mapping', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={{
                        ...CUSTOM_COLOR_PALETTE_CONFIG,
                        colorMapping: [
                            {
                                predicate: getAttributeItemNamePredicate('Red'),
                                color: {
                                    type: 'guid',
                                    value: '03'
                                }
                            }, {
                                predicate: getAttributeItemNamePredicate('Purple'),
                                color: {
                                    type: 'guid',
                                    value: '02'
                                }
                            }, {
                                predicate: getAttributeItemNamePredicate('Pink'),
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
                    onError={onErrorHandler}
                />
            </div>
        )
    )).add('custom colors and color mapping with segment', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    segmentBy={ATTRIBUTE_2}
                    config={{
                        ...CUSTOM_COLOR_PALETTE_CONFIG,
                        colorMapping: [
                            {
                                predicate: getAttributeItemNamePredicate('Red'),
                                color: {
                                    type: 'guid',
                                    value: '03'
                                }
                            }, {
                                predicate: getAttributeItemNamePredicate('Purple'),
                                color: {
                                    type: 'guid',
                                    value: '02'
                                }
                            }, {
                                predicate: getAttributeItemNamePredicate('Pink'),
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
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('custom colors by hexa', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    segmentBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    config={{
                        colors: ['#ff0000', '#00ff00', '#0000ff']
                    }}
                />
            </div>
        )
    ))
    .add('with German number format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('with disabled legend', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
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
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        config={{
                            legend: {
                                position: 'auto'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">left</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        config={{
                            legend: {
                                position: 'left'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">top</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        config={{
                            legend: {
                                position: 'top'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">right</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
                        config={{
                            legend: {
                                position: 'right'
                            }
                        }}
                    />
                </div>
                <div className="storybook-title">bottom</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        onError={onErrorHandler}
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
                <div className="storybook-title">default = auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        segmentBy={ATTRIBUTE_2}
                        onError={onErrorHandler}
                    />
                </div>
                <div className="storybook-title">auto</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        segmentBy={ATTRIBUTE_2}
                        onError={onErrorHandler}
                        config={DATA_LABELS_AUTO_CONFIG}
                    />
                </div>
                <div className="storybook-title">show</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        segmentBy={ATTRIBUTE_2}
                        onError={onErrorHandler}
                        config={DATA_LABELS_VISIBLE_CONFIG}
                    />
                </div>
                <div className="storybook-title">hide</div>
                <div style={wrapperStyle} className="screenshot-container">
                    <Treemap
                        projectId="storybook"
                        measures={[MEASURE_1]}
                        viewBy={ATTRIBUTE_1}
                        segmentBy={ATTRIBUTE_2}
                        onError={onErrorHandler}
                        config={DATA_LABELS_HIDDEN_CONFIG}
                    />
                </div>
            </div>
        )
    ))
    .add('arithmetic measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[
                        MEASURE_1,
                        MEASURE_2,
                        ARITHMETIC_MEASURE_SIMPLE_OPERANDS,
                        ARITHMETIC_MEASURE_USING_ARITHMETIC
                    ]}
                    onError={onErrorHandler}
                />
            </div>
        )
    ));
