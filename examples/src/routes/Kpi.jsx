import React from 'react';
import ExampleWithSource from '../utils/ExampleWithSource';

import KpiExample from '../components/KpiExample';
import KpiExampleSRC from '!raw-loader!../components/KpiExample.jsx'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Kpi = () => (
    <div>
        <h1>KPI</h1>

        <p>This is an example of KPI component use case.</p>

        <ExampleWithSource for={KpiExample} source={KpiExampleSRC} />
    </div>
);

export default Kpi;
