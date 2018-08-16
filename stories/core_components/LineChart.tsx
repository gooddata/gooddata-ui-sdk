import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { LineChart } from '../../src/index';
import { onErrorHandler } from '../mocks';
import { CUSTOM_COLORS } from '../data/colors';
import {
    ATTRIBUTE_1,
    ATTRIBUTE_1_WITH_ALIAS,
    MEASURE_1,
    MEASURE_2,
    ATTRIBUTE_1_SORT_ITEM,
    MEASURE_2_SORT_ITEM,
    MEASURE_WITH_FORMAT
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/LineChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    trendBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('two measures, one attribute with alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    trendBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('some measure with % format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_FORMAT]}
                    trendBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    trendBy={ATTRIBUTE_1}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('sorted by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
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
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    trendBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[MEASURE_2_SORT_ITEM]}
                />
            </div>
        )
    ))
    .add('with German number format in tooltip', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <LineChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    trendBy={ATTRIBUTE_1_WITH_ALIAS}
                    config={GERMAN_SEPARATORS}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
