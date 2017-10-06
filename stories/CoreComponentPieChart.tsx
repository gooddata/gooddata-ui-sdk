import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { PieChart } from '../src/components/core/PieChart';
import { VisualizationTypes } from '../src/constants/visualizationTypes';
import {
    getResultWithOneMeasuresAndOneAttribute,
    getResultWithTwoMeasures
} from '../src/execution/fixtures/SimpleExecutor.fixtures';
import { getMdResultWithOneMeasureAndOneAttribute, getMdResultWithTwoMeasures } from './data/metadataResult';
import { DataSourceMock, MetadataSourceMock, onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('PieChart', module)
    .add('two measures', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                onError={onErrorHandler}
                dataSource={new DataSourceMock(getResultWithTwoMeasures())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasures(VisualizationTypes.PIE))
                }
            />
        </div>
    ))
    .add('measure and attribute', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                onError={onErrorHandler}
                dataSource={new DataSourceMock(getResultWithOneMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithOneMeasureAndOneAttribute(VisualizationTypes.PIE))
                }
            />
        </div>
    ))
    .add('legend on the right for dashboards', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                onError={onErrorHandler}
                dataSource={new DataSourceMock(getResultWithOneMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithOneMeasureAndOneAttribute(VisualizationTypes.PIE))
                }
                environment="dashboards"
            />
        </div>
    ))
    .add('legend on the bottom', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                onError={onErrorHandler}
                dataSource={new DataSourceMock(getResultWithOneMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithOneMeasureAndOneAttribute(VisualizationTypes.PIE))
                }
                config={{ legend: { position: 'bottom' } }}
            />
        </div>
    ));
