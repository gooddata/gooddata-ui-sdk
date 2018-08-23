// (C) 2007-2018 GoodData Corporation
import React from 'react';
import ExampleWithSource from '../components/utils/ExampleWithSource';

import ExecuteExample from '../components/ExecuteExample';
import ExecuteExampleSRC from '!raw-loader!../components/ExecuteExample'; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first


export const Execute = () => (
    <div>
        <h1>Execute</h1>

        <p>
            The Execute component allows you to execute input data and send it to
            the function that you have chosen to use and have implemented.
            You can use the Execute component, for example, to create a report using an arbitrary chart library.
        </p>
        <p>Pass a custom children function to this component to render AFM execution data.</p>

        <hr className="separator" />

        <ExampleWithSource for={ExecuteExample} source={ExecuteExampleSRC} />
    </div>
);

export default Execute;
