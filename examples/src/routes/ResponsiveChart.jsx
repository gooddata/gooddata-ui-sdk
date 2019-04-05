// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import ResponsiveExample from "../components/ResponsiveExample";
import ResponsiveExampleSRC from "!raw-loader!../components/ResponsiveExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const ResponsiveChart = () => (
    <div>
        <h1>Responsive Chart</h1>

        <p>
            By default, all visualizations are responsive and get properly resized when you resize the
            viewport. However, when you resize the chart container without resizing the viewport, the chart
            might get clipped. In this case, set chart dimensions either explicitly or dynamically using the
            Measure component or equivalent.
        </p>

        <ExampleWithSource for={ResponsiveExample} source={ResponsiveExampleSRC} />
    </div>
);

export default ResponsiveChart;
