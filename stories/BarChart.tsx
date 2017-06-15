import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { BarChart } from '../src/components/BarChart';

import '@gooddata/indigo-visualizations/lib/styles/charts.scss';

import { DataSourceMock, MetadataSourceMock } from './mocks';

const twoMeasuresAndAttributeData = {
    isLoaded: true,
    headers: [
        {
            type: 'attrLabel',
            id: '/gdc/md/storybook/obj/3.df',
            title: 'Title /gdc/md/storybook/obj/3.df'
        },
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
    rawData: [
        [
            'Element (/gdc/md/storybook/obj/3.df) 0',
            25.525307255896855,
            59.8976398024532
        ],
        [
            'Element (/gdc/md/storybook/obj/3.df) 1',
            20.868627605878174,
            69.03855922597128
        ],
        [
            'Element (/gdc/md/storybook/obj/3.df) 2',
            76.28053094915377,
            92.28589120249924
        ]
    ],
    warnings: [],
    isEmpty: false
};

const twoMeasuresAndAttributeMD = {
    content: {
        type: 'bar',
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
            categories: [
                {
                    category: {
                        collection: 'attribute',
                        displayForm: '/gdc/md/storybook/obj/3.df'
                    }
                }
            ],
            filters: []
        }
    }
};

storiesOf('BarChart')
    .add('two measures, one attribute', () => (
        <div style={{ width: 800, height: 400 }}>
            <BarChart
                type="bar"
                dataSource={new DataSourceMock(twoMeasuresAndAttributeData)}
                metadataSource={new MetadataSourceMock(twoMeasuresAndAttributeMD)}
                onError={console.error}
            />
        </div>
    )).add('custom colors and legend on bottom', () => (
        <div style={{ width: 800, height: 400 }}>
            <BarChart
                type="bar"
                dataSource={new DataSourceMock(twoMeasuresAndAttributeData)}
                metadataSource={new MetadataSourceMock(twoMeasuresAndAttributeMD)}
                onError={console.error}
                config={{
                    colors: [
                        'rgba(195, 49, 73, 1)',
                        'rgba(168, 194, 86, 1)',
                        'rgba(243, 217, 177, 1)',
                        'rgba(194, 153, 121, 1)',
                        'rgba(162, 37, 34, 1)'
                    ],
                    legend: {
                        position: 'bottom'
                    }
                }}
            />
        </div>
    ));
