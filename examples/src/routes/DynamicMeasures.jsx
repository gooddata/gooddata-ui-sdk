// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import DynamicMeasuresExample from "../components/DynamicMeasuresExample";
import DynamicMeasuresExampleSRC from "!raw-loader!../components/DynamicMeasuresExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const DynamicMeasures = () => (
    <div>
        <h1>Dynamic Measures</h1>

        <p>This is how you can dynamically set (add or remove) measures in your visualization.</p>
        <p>
            Measures tagged with the franchise_fees tag are displayed in the multi-selection list on the left.
            The visualizations display only the measures selected in the list.
        </p>

        <ExampleWithSource for={DynamicMeasuresExample} source={DynamicMeasuresExampleSRC} />
    </div>
);

export default DynamicMeasures;
