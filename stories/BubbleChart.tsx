import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { BubbleChart } from '../src';
import { onErrorHandler } from './mocks';
import {
    ATTRIBUTE_1,
    MEASURE_1,
    MEASURE_2,
    MEASURE_3
} from './data/componentProps';

storiesOf('Core components/BubbleChart', module)
    .add('basic render', () => (
            <div style={{ width: 800, height: 400 }}>
                <BubbleChart
                    projectId="storybook"
                    xAxisMeasure={MEASURE_1}
                    yAxisMeasure={MEASURE_2}
                    size={MEASURE_3}
                    viewBy={ATTRIBUTE_1}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
    ));
