import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { DualChart } from '../src/components/DualChart';
import { onErrorHandler } from './mocks';
import { ATTRIBUTE_1, MEASURE_1, MEASURE_2 } from './data/componentProps';

storiesOf('Core components/DualChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
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
    ));
