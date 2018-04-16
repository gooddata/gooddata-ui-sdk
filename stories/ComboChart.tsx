import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { ComboChart } from '../src';
import { onErrorHandler } from './mocks';
import { CUSTOM_COLORS } from './data/colors';
import { ATTRIBUTE_1, MEASURE_1, MEASURE_2 } from './data/componentProps';

storiesOf('Core components/ComboChart', module)
    .add('one column measure, one line measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    columnMeasures={[MEASURE_1]}
                    lineMeasures={[MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('custom colors', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <ComboChart
                    projectId="storybook"
                    columnMeasures={[MEASURE_1]}
                    lineMeasures={[MEASURE_2]}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                    config={{ colors: CUSTOM_COLORS }}
                />
            </div>
        )
    ));
