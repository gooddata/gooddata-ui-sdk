import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Table } from '../src/components/Table';

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
            {
                id: '1',
                name: 'Element (/gdc/md/storybook/obj/3.df) 0'
            },
            25.525307255896855,
            59.8976398024532
        ],
        [
            {
                id: '2',
                name: 'Element (/gdc/md/storybook/obj/3.df) 1'
            },
            20.868627605878174,
            69.03855922597128
        ],
        [
            {
                id: '3',
                name: 'Element (/gdc/md/storybook/obj/3.df) 2'
            },
            76.28053094915377,
            92.28589120249924
        ]
    ],
    warnings: [],
    isEmpty: false
};

const twoMeasuresAndAttributeMD = {
    content: {
        type: 'table',
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

const withIdentifiersData = {
    isLoaded: true,
    headers: [
        {
            type: 'attrLabel',
            id: '3.df',
            title: 'Title 3.df'
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
            {
                id: '1',
                name: 'Element (3.df) 0'
            },
            22.61219185361125,
            42.15221061488796
        ],
        [
            {
                id: '2',
                name: 'Element (3.df) 1'
            },
            17.95269276702105,
            66.77392105963627
        ],
        [
            {
                id: '3',
                name: 'Element (3.df) 2'
            },
            14.285548411842397,
            22.993364919295157
        ]
    ],
    warnings: [],
    isEmpty: false
};

const withIdentifiersMD = {
    content: {
        type: 'bar',
        buckets: {
            measures: [
                {
                    measure: {
                        measureFilters: [],
                        objectUri: '1',
                        showInPercent: false,
                        showPoP: false,
                        title: 'My measure',
                        type: 'metric'
                    }
                },
                {
                    measure: {
                        measureFilters: [],
                        objectUri: '2',
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
                        collection: 'attribute'
                    }
                }
            ],
            filters: []
        }
    }
};

storiesOf('Table')
    .add('two measures, one attribute', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                dataSource={new DataSourceMock(twoMeasuresAndAttributeData)}
                metadataSource={new MetadataSourceMock(twoMeasuresAndAttributeMD)}
                onError={console.error}
            />
        </div>
    ))
    .add('two measures, one attribute with identifiers', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                dataSource={new DataSourceMock(withIdentifiersData)}
                metadataSource={new MetadataSourceMock(withIdentifiersMD)}
                onError={console.error}
            />
        </div>
    ));
