import React from 'react';
import ExampleWithSource from '../utils/ExampleWithSource';

import ExecuteExample from '../components/ExecuteExample';
import ExecuteExampleSRC from '!raw-loader!../components/ExecuteExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first


export const Kpi = () => (
    <div>
        <h1>Execute</h1>

        <p>This is an example of custom Execute component use case.</p>

        <ExampleWithSource for={ExecuteExample} source={ExecuteExampleSRC} />
    </div>
);

export default Kpi;
