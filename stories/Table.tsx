import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Table } from '../src/components/Table';

import '@gooddata/indigo-visualizations/lib/styles/table.scss';

storiesOf('Table')
    .add('two measures, one attribute', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                projectId="storybook"
                afm={{
                    measures: [{
                        id: 'm1',
                        definition: {
                            baseObject: {
                                id: '/gdc/md/storybook/obj/1'
                            }
                        }
                    }, {
                        id: 'm2',
                        definition: {
                            baseObject: {
                                id: '/gdc/md/storybook/obj/2'
                            }
                        }
                    }],
                    attributes: [
                        {
                            id: '/gdc/md/storybook/obj/3.df'
                        }
                    ]
                }}
                transformation={{
                    measures: [{
                        id: 'm1',
                        title: 'My measure'
                    }, {
                        id: 'm2',
                        title: 'My second measure'
                    }]
                }}
                onError={console.error}
            />
        </div>
    ))
    .add('two measures, one attribute with identifiers', () => (
        <div style={{ width: 600, height: 300 }}>
            <Table
                projectId="storybook"
                afm={{
                    measures: [{
                        id: 'm1',
                        definition: {
                            baseObject: {
                                id: '1'
                            }
                        }
                    }, {
                        id: 'm2',
                        definition: {
                            baseObject: {
                                id: '2'
                            }
                        }
                    }],
                    attributes: [
                        {
                            id: '3.df'
                        }
                    ]
                }}
                transformation={{
                    measures: [{
                        id: 'm1',
                        title: 'My measure'
                    }, {
                        id: 'm2',
                        title: 'My second measure'
                    }]
                }}
                onError={console.error}
            />
        </div>
    ));
