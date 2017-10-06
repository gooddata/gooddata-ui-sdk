import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { BarChart } from '../src/components/core/BarChart';
import { VisualizationTypes } from '../src/constants/visualizationTypes';
import { CUSTOM_COLORS } from './data/colors';
import { getResultWithTwoMeasuresAndOneAttribute } from '../src/execution/fixtures/SimpleExecutor.fixtures';
import { getMdResultWithTwoMeasuresAndOneAttribute } from './data/metadataResult';
import { DataSourceMock, MetadataSourceMock, onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('BarChart', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 800, height: 400 }}>
            <BarChart
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.BAR))
                }
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('custom colors and legend on bottom', () => (
        <div style={{ width: 800, height: 400 }}>
            <BarChart
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.BAR))
                }
                onError={onErrorHandler}
                config={{
                    colors: CUSTOM_COLORS,
                    legend: {
                        position: 'bottom'
                    }
                }}
            />
        </div>
    ));
