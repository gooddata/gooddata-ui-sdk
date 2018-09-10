// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { Headline } from '../../src/index';
import {
    MEASURE_1_WITH_ALIAS,
    MEASURE_2,
    MEASURE_1,
    MEASURE_1_POP,
    MEASURE_1_PREVIOUS_PERIOD
} from '../data/componentProps';
import { GERMAN_SEPARATORS } from '../data/numberFormat';

const wrapperStyle = { width: 600, height: 300 };

storiesOf('Core components/Headline', module)
    .add('one measure with alias', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Headline
                    projectId="storybook"
                    primaryMeasure={MEASURE_1_WITH_ALIAS}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('two measures', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Headline
                    projectId="storybook"
                    primaryMeasure={MEASURE_1_WITH_ALIAS}
                    secondaryMeasure={MEASURE_2}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('two measures with PoP', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Headline
                    projectId="storybook"
                    primaryMeasure={MEASURE_1}
                    secondaryMeasure={MEASURE_1_POP}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('two measures with previous period', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Headline
                    projectId="storybook"
                    primaryMeasure={MEASURE_1}
                    secondaryMeasure={MEASURE_1_PREVIOUS_PERIOD}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('with German number format', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <Headline
                    projectId="storybook"
                    primaryMeasure={MEASURE_1_WITH_ALIAS}
                    secondaryMeasure={MEASURE_2}
                    config={GERMAN_SEPARATORS}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
