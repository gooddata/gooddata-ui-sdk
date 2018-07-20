import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { AreaChart } from '../../src/index';
import { onErrorHandler } from '../mocks';
import { ATTRIBUTE_1,
    ATTRIBUTE_2,
    MEASURE_1,
    MEASURE_2,
    MEASURE_2_SORT_ITEM,
    MEASURE_WITH_NULLS,
    ATTRIBUTE_1_SORT_ITEM
} from '../data/componentProps';

const wrapperStyle = { width: 800, height: 400 };

storiesOf('Core components/AreaChart', module)
    .add('two measures, one attribute, stack by default', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('disabled stack by config', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        stacking: false
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('enabled stack by config', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        stacking: true
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('stack by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    stackBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('disabled stack by config and stack by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    stackBy={ATTRIBUTE_2}
                    onError={onErrorHandler}
                    config={{
                        stacking: false
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('sorted by attribute', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
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
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    sortBy={[MEASURE_2_SORT_ITEM]}
                />
            </div>
        )
    )).add('undefined values with stacking', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_NULLS]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    )).add('undefined values without stacking', () => (
        screenshotWrap(
            <div style={wrapperStyle}>
                <AreaChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_WITH_NULLS]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    config={{
                        stacking: false
                    }}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
