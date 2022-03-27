// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";

import Execute from "./ExecuteSrc";
import ExecuteSRC from "./ExecuteSrc?raw";
import ExecuteSRCJS from "./ExecuteSrc?rawJS";

import ExecuteWithSlices from "./ExecuteWithSlicesSrc";
import ExecuteWithSlicesSRC from "./ExecuteWithSlicesSrc?raw";
import ExecuteWithSlicesSRCJS from "./ExecuteWithSlicesSrc?rawJS";

import ExecuteWithCustomVisualization from "./ExecuteWithCustomVisualizationSrc";
import ExecuteWithCustomVisualizationSRC from "./ExecuteWithCustomVisualizationSrc?raw";
import ExecuteWithCustomVisualizationSRCJS from "./ExecuteWithCustomVisualizationSrc?rawJS";

const ExecuteComponent = (): JSX.Element => (
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

        <ExampleWithSource for={Execute} source={ExecuteSRC} sourceJS={ExecuteSRCJS} />

        <hr className="separator" />

        <p>
            This example of Execute component shows how to obtain and work with data series sliced by multiple
            attributes.
        </p>

        <ExampleWithSource
            for={ExecuteWithSlices}
            source={ExecuteWithSlicesSRC}
            sourceJS={ExecuteWithSlicesSRCJS}
        />

        <hr className="separator" />

        <p>
            This example of Execute component shows how to obtain data and use them in a custom visualization.
        </p>

        <ExampleWithSource
            for={ExecuteWithCustomVisualization}
            source={ExecuteWithCustomVisualizationSRC}
            sourceJS={ExecuteWithCustomVisualizationSRCJS}
        />
    </div>
);

export default ExecuteComponent;
