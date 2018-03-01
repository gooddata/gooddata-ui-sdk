import React from 'react';
import ExampleWithSource from '../components/utils/ExampleWithSource';

import KpiExample from '../components/KpiExample';
import KpiExampleSRC from '!raw-loader!../components/KpiExample.jsx'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const Kpi = () => (
    <div>
        <h1>KPI</h1>

        <p>This is an example of the KPI component.</p>

        <hr className="separator" />

        <ExampleWithSource for={KpiExample} source={KpiExampleSRC} />
    </div>
);

export default Kpi;
