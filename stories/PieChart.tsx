import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { PieChart } from '../src/components/PieChart';

import '@gooddata/indigo-visualizations/lib/styles/charts.scss';

storiesOf('PieChart')
    .add('two measures', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
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
                onError={console.error}
            />
        </div>
    ))
    .add('measure and attribute', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
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
                            type: 'date'
                        }
                    ]
                }}
                transformation={{
                    measures: [{
                        id: 'm1',
                        title: 'My measure'
                    }]
                }}
                onError={console.error}
            />
        </div>
    ))
    .add('legend on the bottom', () => (
        <div style={{ width: 400, height: 400 }}>
            <PieChart
                type="pie"
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
                            type: 'date'
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
                onError={console.error}
            />
        </div>
    ));
