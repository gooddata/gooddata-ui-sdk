// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { DualChart } from '../../src/components/DualChart';
import { onErrorHandler } from '../mocks';
import {
    ATTRIBUTE_1,
    MEASURE_1,
    MEASURE_2,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    MEASURE_WITH_FORMAT
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/DualChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DualChart
                    projectId="storybook"
                    leftAxisMeasure={MEASURE_1}
                    rightAxisMeasure={MEASURE_2}
                    trendBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('sorted by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DualChart
                    projectId="storybook"
                    leftAxisMeasure={MEASURE_1}
                    rightAxisMeasure={MEASURE_2}
                    trendBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[ATTRIBUTE_1_SORT_ITEM]}
                />
            </div>
        )
    ))
    .add('sorted by measure', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DualChart
                    projectId="storybook"
                    leftAxisMeasure={MEASURE_1}
                    rightAxisMeasure={MEASURE_2}
                    trendBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[MEASURE_2_SORT_ITEM]}
                />
            </div>
        )
    ))
    .add('two measures, one attribute, % format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <DualChart
                    projectId="storybook"
                    leftAxisMeasure={MEASURE_WITH_FORMAT}
                    rightAxisMeasure={MEASURE_2}
                    trendBy={ATTRIBUTE_1}
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
                <DualChart
                    projectId="storybook"
                    leftAxisMeasure={MEASURE_1}
                    rightAxisMeasure={MEASURE_2}
                    trendBy={ATTRIBUTE_1}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
