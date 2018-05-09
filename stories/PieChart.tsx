import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { PieChart } from '../src';
import { onErrorHandler } from './mocks';
import { ATTRIBUTE_1, ATTRIBUTE_1_WITH_ALIAS, MEASURE_1, MEASURE_1_WITH_ALIAS, MEASURE_2 } from './data/componentProps';

storiesOf('Core components/PieChart', module)
    .add('two measures', () => (
        screenshotWrap(
            <div style={{ width: 400, height: 400 }}>
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
            <div style={{ width: 400, height: 400 }}>
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
            <div style={{ width: 400, height: 400 }}>
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
    .add('legend on the bottom', () => (
        screenshotWrap(
            <div style={{ width: 400, height: 400 }}>
                <PieChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={{ legend: { position: 'bottom' } }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
