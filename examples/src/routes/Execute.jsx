import React from 'react';
import Layout from '../components/Layout';
import ExampleWithSource from '../utils/ExampleWithSource';

import ExecuteExample from '../components/ExecuteExample';
import ExecuteExampleSRC from '!raw-loader!../components/ExecuteExample';


export const Kpi = props => (<Layout {...props} >
    <h1>Execute</h1>

    <p>This is an example of custom Execute component use case.</p>

    <ExampleWithSource for={ExecuteExample} source={ExecuteExampleSRC} />
</Layout>);

export default Kpi;
