import * as React from 'react';
import { storiesOf } from '@storybook/react';

import { Table } from '../src/components/core/Table';
import { VisualizationTypes } from '../src/constants/visualizationTypes';
import { getResultWithTwoMeasuresAndOneAttribute } from '../src/execution/fixtures/SimpleExecutor.fixtures';
import { getMdResultWithTwoMeasuresAndOneAttribute } from './data/metadataResult';
import { DataSourceMock, MetadataSourceMock, onErrorHandler } from './mocks';
import '../styles/scss/charts.scss';

storiesOf('Table', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.TABLE))
                }
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('two measures, one attribute with identifiers', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute(true))}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.TABLE, true))
                }
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('external transformation', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                dataSource={new DataSourceMock(getResultWithTwoMeasuresAndOneAttribute())}
                metadataSource={
                    new MetadataSourceMock(getMdResultWithTwoMeasuresAndOneAttribute(VisualizationTypes.TABLE, true))
                }
                transformation={{
                    measures: [
                        {
                            id: 'm1',
                            title: 'redefined title',
                            format: '---#---'
                        }
                    ]
                }}
                onError={onErrorHandler}
            />
        </div>
    ));
