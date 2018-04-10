import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { AreaChart } from '../src';
import { onErrorHandler } from './mocks';
import { ATTRIBUTE_1, ATTRIBUTE_2, MEASURE_1, MEASURE_2 } from './data/componentProps';

const dimensions = { width: 800, height: 400 };

storiesOf('Internal/HighCharts/AreaChart', module)
    .add('two measures, one attribute, stack by default', () => (
        screenshotWrap(
            <div style={{ ...dimensions }}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('disabled stack by config', () => (
        screenshotWrap(
            <div style={{ ...dimensions }}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    config={{
                        stacking: false
                    }}
                />
            </div>
        )
    ))
    .add('enabled stack by config', () => (
        screenshotWrap(
            <div style={{ ...dimensions }}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={[ATTRIBUTE_1]}
                    onError={onErrorHandler}
                    config={{
                        stacking: true
                    }}
                />
            </div>
        )
    ))
    .add('stack by attribute', () => (
        screenshotWrap(
            <div style={{ ...dimensions }}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1]}
                    stackBy={[ATTRIBUTE_2]}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('disabled stack by config and stack by attribute', () => (
        screenshotWrap(
            <div style={{ ...dimensions }}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={[ATTRIBUTE_1]}
                    stackBy={[ATTRIBUTE_2]}
                    onError={onErrorHandler}
                    config={{
                        stacking: false
                    }}
                />
            </div>
        )
    ));
