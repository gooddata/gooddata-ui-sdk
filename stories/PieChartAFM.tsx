import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { PieChart } from '../src/components/afm/PieChart';

import '../styles/scss/charts.scss';
import { onErrorHandler } from './mocks';

storiesOf('AFM components - PieChart', module)
    .add('two measures', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
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
                    }]
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
    .add('measure and attribute', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
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
                            id: '/gdc/md/storybook/obj/4.df',
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
                onError={onErrorHandler}
            />
        </div>
    ))
    .add('legend on the bottom', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
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
                            id: '/gdc/md/storybook/obj/4.df',
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
                    legend: {
                        position: 'bottom'
                    }
                }}
                onError={onErrorHandler}
            />
        </div>
    ));

