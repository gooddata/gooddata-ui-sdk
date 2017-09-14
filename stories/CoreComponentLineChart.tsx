import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { LineChart } from '../src/components/core/LineChart';
import { VisualizationTypes } from '../src/constants/visualizationTypes';
import { CUSTOM_COLORS } from './data/colors';
import { getResultWithTwoMeasuresAndOneAttribute } from '../src/execution/fixtures/SimpleExecutor.fixtures';
import { getMdResultWithTwoMeasuresAndOneAttribute } from './data/metadataResult';
import { DataSourceMock, MetadataSourceMock, onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('LineChart', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 800, height: 400 }}>
            <LineChart
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.LINE))
                }
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('custom colors', () => (
        <div style={{ width: 800, height: 400 }}>
            <LineChart
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.LINE))
                }
                onError={onErrorHandler}
                config={{ colors: CUSTOM_COLORS }}
            />
        </div>
    ));
