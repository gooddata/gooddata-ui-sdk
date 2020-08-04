// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { DynamicMeasuresExample } from "./DynamicMeasuresExample";
import DynamicMeasuresExampleSRC from "!raw-loader!./DynamicMeasuresExample";
import DynamicMeasuresExampleSRCJS from "!raw-loader!../../../../examplesJS/advanced/dynamicMeasures/DynamicMeasuresExample";

export const DynamicMeasures: React.FC = () => (
    <div>
        <h1>Dynamic Measures</h1>

        <p>This is how you can dynamically set (add or remove) measures in your insightView.</p>
        <p>
            Measures tagged with the franchise_fees tag are displayed in the multi-selection list on the left.
            The insightViews display only the measures selected in the list.
        </p>

        <ExampleWithSource
            for={DynamicMeasuresExample}
            source={DynamicMeasuresExampleSRC}
            sourceJS={DynamicMeasuresExampleSRCJS}
        />
    </div>
);
