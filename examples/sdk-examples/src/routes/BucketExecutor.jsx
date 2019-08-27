// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import BucketExecutorExample from "../components/BucketExecutorExample";
import BucketExecutorExampleSRC from "!raw-loader!../components/BucketExecutorExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const BucketExecutor = () => (
    <div>
        <h1>BucketExecutor</h1>

        <p>
            The BucketExecutor component allows you to execute measures and attributes in the same format as
            for example ColumnChart &quot;measures&quot; and &quot;viewBy&quot; props. You need to specify
            required structure using the &quot;dimensions&quot; prop in a two dimensional array. First
            dimension specifies rows of data, second dimension specifies columns of data. Execution results
            are sent to a custom children function. You can use the BucketExecutor component to create
            visualizations using 3rd party libraries.
        </p>
        <p>Pass a custom children function to this component to render execution data.</p>
        <p>Compared to Execute component, BucketExecutor allows:</p>
        <ul>
            <li>an interface similar to basic components (e.g. the ColumnChart)</li>
            <li>two dimensional paging</li>
            <li>an option to trigger data loading manually</li>
            <li>
                <strong>does not support totals</strong>
            </li>
        </ul>

        <hr className="separator" />

        <ExampleWithSource for={BucketExecutorExample} source={BucketExecutorExampleSRC} />
    </div>
);

export default BucketExecutor;
