import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Table } from '../src/components/afm/Table';

import '../styles/scss/charts.scss';

import { onErrorHandler } from './mocks';

storiesOf('AFM components - Table', module)
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
                            id: '/gdc/md/storybook/obj/3.df',
                            type: 'attribute'
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
                onError={onErrorHandler}
            />
        </div>
    ));
