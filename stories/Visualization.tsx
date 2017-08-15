import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Visualization } from '../src/components/Visualization';

import '@gooddata/indigo-visualizations/lib/styles/charts.scss';
import '@gooddata/indigo-visualizations/lib/styles/table.scss';

storiesOf('Visualization', module)
    .add('table example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                uri={'/gdc/md/myproject/obj/1001'}
                onError={console.error}
            />
        </div>
    ))
    .add('chart example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                uri={'/gdc/md/myproject/obj/1002'}
                onError={console.error}
            />
        </div>
    )).add('chart with custom colors example', () => (
        <div style={{ width: 800, height: 400 }}>
            <Visualization
                uri={'/gdc/md/myproject/obj/1002'}
                config={{
                    colors: [
                        'rgba(195, 49, 73, 1)',
                        'rgba(168, 194, 86, 1)',
                        'rgba(243, 217, 177, 1)',
                        'rgba(194, 153, 121, 1)',
                        'rgba(162, 37, 34, 1)'
                    ]
                }}
                onError={console.error}
            />
        </div>
    ));
