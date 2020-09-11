// (C) 2007-2019 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExecuteExample } from "./ExecuteExample";
import { ExecuteWithSlicesExample } from "./ExecuteWithSlicesExample";
import { ExecuteAttributeValuesExample } from "./ExecuteAttributeValuesExample";
import { ExecuteWithCustomVisualizationExample } from "./ExecuteWithCustomVisualizationExample";
import { ExampleWithSource } from "../../components/ExampleWithSource";

import ExecuteExampleSRC from "!raw-loader!./ExecuteExample";
import ExecuteWithSlicesExampleSRC from "!raw-loader!./ExecuteWithSlicesExample";
import ExecuteAttributeValuesExampleSRC from "!raw-loader!./ExecuteAttributeValuesExample";
import ExecuteWithCustomVisualizationExampleSRC from "!raw-loader!./ExecuteWithCustomVisualizationExample";

import ExecuteExampleSRCJS from "!raw-loader!../../../examplesJS/execution/ExecuteExample";
import ExecuteWithSlicesExampleSRCJS from "!raw-loader!../../../examplesJS/execution/ExecuteWithSlicesExample";
import ExecuteAttributeValuesExampleSRCJS from "!raw-loader!../../../examplesJS/execution/ExecuteAttributeValuesExample";
import ExecuteWithCustomVisualizationExampleSRCJS from "!raw-loader!../../../examplesJS/execution/ExecuteWithCustomVisualizationExample";

export const Execute: React.FC = () => (
    <div>
        <h1>Execute</h1>

        <p>
            The Execute component allows you to trigger execution and send its result to the function that you
            have chosen to use and have implemented. The Execute component provides a curated API through
            which you specify data series that you would like to calculate and optionally sliced by some
            attribute values. The result passed to to your function provides convenience functions to access
            the computed data points.
        </p>

        <hr className="separator" />

        <p>
            This example of Execute component shows how to obtain a single formatted value and use it as a
            custom-made KPI.
        </p>

        <ExampleWithSource for={ExecuteExample} source={ExecuteExampleSRC} sourceJS={ExecuteExampleSRCJS} />

        <hr className="separator" />

        <p>
            This example of Execute component shows how to obtain and work with data series sliced by multiple
            attributes.
        </p>

        <ExampleWithSource
            for={ExecuteWithSlicesExample}
            source={ExecuteWithSlicesExampleSRC}
            sourceJS={ExecuteWithSlicesExampleSRCJS}
        />

        <hr className="separator" />

        <p>
            This example of Execute component shows how to obtain data and use them in a custom visualization.
        </p>

        <ExampleWithSource
            for={ExecuteWithCustomVisualizationExample}
            source={ExecuteWithCustomVisualizationExampleSRC}
            sourceJS={ExecuteWithCustomVisualizationExampleSRCJS}
        />

        <h1>RawExecute</h1>
        <p>
            The RawExecute components allows you trigger execution and send its result to the function that
            you have chosen to use and have implemented. The RawExecute provides no guidelines and allows you
            to construct any execution you would like using the underlying backend APIs.
        </p>

        <hr className="separator" />

        <ExampleWithSource
            for={ExecuteAttributeValuesExample}
            source={ExecuteAttributeValuesExampleSRC}
            sourceJS={ExecuteAttributeValuesExampleSRCJS}
        />
    </div>
);
