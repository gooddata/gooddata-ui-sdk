import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { LineChart } from '../src/components/core/LineChart';

import '../styles/scss/charts.scss';

import { DataSourceMock, MetadataSourceMock, onErrorHandler } from './mocks';

const twoMeasuresAndAttributeData = {
    isLoaded: true,
    headers: [
        {
            type: 'metric',
            id: 'm1',
            title: 'Title m1'
        },
        {
            type: 'metric',
            id: 'm2',
            title: 'Title m2'
        }
    ],
    rawData: [[54.86307837343727, 32.901268944187144]],
    warnings: [],
    isEmpty: false
};

const twoMeasuresAndAttributeMD = {
    content: {
        type: 'pie',
        buckets: {
            measures: [
                {
                    measure: {
                        measureFilters: [],
                        objectUri: '/gdc/md/storybook/obj/1',
                        showInPercent: false,
                        showPoP: false,
                        title: 'My measure',
                        type: 'metric'
                    }
                },
                {
                    measure: {
                        measureFilters: [],
                        objectUri: '/gdc/md/storybook/obj/2',
                        showInPercent: false,
                        showPoP: false,
                        title: 'My second measure',
                        type: 'metric'
                    }
                }
            ],
            categories: [],
            filters: []
        }
    }
};

storiesOf('LineChart', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 800, height: 400 }}>
            <LineChart
                dataSource={new DataSourceMock(twoMeasuresAndAttributeData)}
                metadataSource={new MetadataSourceMock(twoMeasuresAndAttributeMD)}
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('custom colors', () => (
        <div style={{ width: 800, height: 400 }}>
            <LineChart
                dataSource={new DataSourceMock(twoMeasuresAndAttributeData)}
                metadataSource={new MetadataSourceMock(twoMeasuresAndAttributeMD)}
                onError={onErrorHandler}
                config={{
                    colors: [
                        'rgba(162, 37, 34, 1)',
                        'rgba(194, 153, 121, 1)',
                        'rgba(195, 49, 73, 1)',
                        'rgba(168, 194, 86, 1)',
                        'rgba(243, 217, 177, 1)'
                    ]
                }}
            />
        </div>
    ));
