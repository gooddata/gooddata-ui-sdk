// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Treemap } from '../../src/index';
import { CUSTOM_COLORS } from '../data/colors';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    ATTRIBUTE_2,
    MEASURE_1,
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    MEASURE_3
} from '../data/componentProps';

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
    .add('legend on the bottom', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={{ legend: { position: 'bottom' } }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Treemap
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ));
