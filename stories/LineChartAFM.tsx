import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { LineChart } from '../src/components/afm/LineChart';

import '../styles/scss/charts.scss';
import { onErrorHandler } from './mocks';


storiesOf('AFM components - LineChart', module)
    .add('two measures, one attribute', () => (
        <div style={{ width: 800, height: 400 }}>
            <LineChart
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
    ))
    .add('custom colors', () => (
        <div style={{ width: 800, height: 400 }}>
            <LineChart
                projectId="storybook"
                afm={{
                    measures: [{
                        id: 'm1',
                        definition: {
                            baseObject: {
                                id: '/gdc/md/storybook/obj/1'
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
                    }]
                }}
                config={{
                    colors: [
                        'rgba(195, 49, 73, 1)',
                        'rgba(168, 194, 86, 1)',
                        'rgba(243, 217, 177, 1)',
                        'rgba(194, 153, 121, 1)',
                        'rgba(162, 37, 34, 1)'
                    ]
                }}
                onError={onErrorHandler}
            />
        </div>
    ));
