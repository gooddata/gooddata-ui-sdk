import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { ColumnChart } from '../src';
import { onErrorHandler } from './mocks';
import { CUSTOM_COLORS } from './data/colors';
import { ATTRIBUTE_1, ATTRIBUTE_1_WITH_ALIAS, MEASURE_1, MEASURE_2 } from './data/componentProps';

storiesOf('ColumnChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('two measures, one attribute with alias', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1, MEASURE_2]}
                    viewBy={ATTRIBUTE_1_WITH_ALIAS}
                    onError={onErrorHandler}
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ColumnChart
                    projectId="storybook"
                    measures={[MEASURE_1]}
                    viewBy={ATTRIBUTE_1}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                />
            </div>
        )
    ));
