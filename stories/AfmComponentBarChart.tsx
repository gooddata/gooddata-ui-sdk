import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { BarChart } from '../src/components/afm/BarChart';
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE,
    TRANSFORMATION_ONE_MEASURE,
    TRANSFORMATION_TWO_MEASURES
} from './data/afmComponentProps';
import { CUSTOM_COLORS } from './data/colors';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components - BarChart', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 800, height: 400 }}>
            <BarChart
                projectId="storybook"
                afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                transformation={TRANSFORMATION_TWO_MEASURES}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('custom colors', () => (
        <div style={{ width: 800, height: 400 }}>
            <BarChart
                projectId="storybook"
                afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                transformation={TRANSFORMATION_ONE_MEASURE}
                config={{ colors: CUSTOM_COLORS }}
                onError={onErrorHandler}
            />
        </div>
    ));
