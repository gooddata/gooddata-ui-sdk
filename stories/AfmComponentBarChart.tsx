// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { screenshotWrap } from '@gooddata/test-storybook';

import { BarChart } from '../src/components/afm/BarChart';
import {
    AFM_ONE_MEASURE_ONE_ATTRIBUTE,
    AFM_ONE_RENAMED_MEASURE,
    AFM_TWO_MEASURES_ONE_ATTRIBUTE,
    AFM_ONE_MEASURE_TWO_ATTRIBUTES
} from './data/afmComponentProps';
import { CUSTOM_COLORS } from './data/colors';
import { onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('AFM components/BarChart', module)
    .add('two measures, one attribute', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BarChart
                    projectId="storybook"
                    afm={AFM_TWO_MEASURES_ONE_ATTRIBUTE}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('stacked bar chart', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BarChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_TWO_ATTRIBUTES}
                    resultSpec={{
                        dimensions: [
                            {
                                itemIdentifiers: ['a1']
                            },
                            {
                                itemIdentifiers: ['a2', 'measureGroup']
                            }
                        ]
                    }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ))
    .add('custom axis label (renaming, alias)', () => (
        screenshotWrap(
            <div style={{ width: 800, height: 400 }}>
                <BarChart
                    projectId="storybook"
                    afm={AFM_ONE_RENAMED_MEASURE}
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
                <BarChart
                    projectId="storybook"
                    afm={AFM_ONE_MEASURE_ONE_ATTRIBUTE}
                    config={{ colors: CUSTOM_COLORS }}
                    onError={onErrorHandler}
                    LoadingComponent={null}
                    ErrorComponent={null}
                />
            </div>
        )
    ));
