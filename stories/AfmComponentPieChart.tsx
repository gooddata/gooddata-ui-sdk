import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { PieChart } from '../src/components/afm/PieChart';
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES
} from './data/afmComponentProps';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components - PieChart', module)
    .add('two measures', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                projectId="storybook"
                afm={AFM_TWO_MEASURES}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('measure and attribute', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                projectId="storybook"
                afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('legend on the bottom', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                projectId="storybook"
                afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                config={{ legend: { position: 'bottom' } }}
                onError={onErrorHandler}
            />
        </div>
    ));
