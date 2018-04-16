// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { DonutChart } from '../src/components/afm/DonutChart';
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_TWO_MEASURES,
    AFM_ONE_RENAMED_MEASURE_ONE_RENAMED_ATTRIBUTE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE
} from './data/afmComponentProps';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components/DonutChart', module)
    .add('two measures', () => (
        screenshotWrap(
            <div style={{ width: 400, height: 400 }}>
                <DonutChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES}
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
                <DonutChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('renamed measure and renamed attribute', () => (
        screenshotWrap(
            <div style={{ width: 400, height: 400 }}>
                <DonutChart
                    projectId="storybook"
                    afm={AFM_ONE_RENAMED_MEASURE_ONE_RENAMED_ATTRIBUTE}
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
                <DonutChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{ legend: { position: 'bottom' } }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('error', () => (
        screenshotWrap(
            <div style={{ width: 400, height: 400, display: 'flex', flexDirection: 'column' }}>
                <DonutChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    config={{ legend: { position: 'bottom' } }}
                    LoadingComponent={null}
                />
            </div>
        )
    ));
