import * as React from 'react';
import '@gooddata/indigo-visualizations/lib/styles/charts.scss';
import { storiesOf } from '@storybook/react';
import { PieChart } from '../src/components/PieChart';
import { DataSourceMock, MetadataSourceMock } from './mocks';

const twoMeasuresData = {
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

const twoMeasuresMD = {
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
const measureAndAttributeData = {
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
        }
    ],
    rawData: [
        [
            {
                id: '1',
                name: 'Element (/gdc/md/storybook/obj/3.df) 0'
            },
            24.47418736303053
        ],
        [
            {
                id: '2',
                name: 'Element (/gdc/md/storybook/obj/3.df) 1'
            },
            46.31826904724989
        ],
        [
            {
                id: '3',
                name: 'Element (/gdc/md/storybook/obj/3.df) 2'
            },
            63.306397981244714
        ]
    ],
    warnings: [],
    isEmpty: false
};
const measureAndAttributeMD = {
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


storiesOf('PieChart')
    .add('two measures', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
                onError={console.error}
                dataSource={new DataSourceMock(twoMeasuresData)}
                metadataSource={new MetadataSourceMock(twoMeasuresMD)}
            />
        </div>
    ))
    .add('measure and attribute', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
                onError={console.error}
                dataSource={new DataSourceMock(measureAndAttributeData)}
                metadataSource={new MetadataSourceMock(measureAndAttributeMD)}
            />
        </div>
    ))
    .add('legend on the right for dashboards', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
                onError={console.error}
                dataSource={new DataSourceMock(measureAndAttributeData)}
                metadataSource={new MetadataSourceMock(measureAndAttributeMD)}
                environment="dashboards"
            />
        </div>
    ))
    .add('legend on the bottom', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
                onError={console.error}
                dataSource={new DataSourceMock(measureAndAttributeData)}
                metadataSource={new MetadataSourceMock(measureAndAttributeMD)}
                config={{
                    legend: {
                        position: 'bottom'
                    }
                }}
            />
        </div>
    ));


