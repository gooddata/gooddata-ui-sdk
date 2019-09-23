// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";

import CustomLegendExample from "../components/CustomLegendExample";
import CustomLegendExampleSRC from "!raw-loader!../components/CustomLegendExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const CustomLegend = () => (
    <div>
        <h1>Custom legend</h1>

        <p>
            You can access legend items via <code>onLegendReady</code> and render custom legend.
        </p>

        <ExampleWithSource for={CustomLegendExample} source={CustomLegendExampleSRC} />
    </div>
);

export default CustomLegend;
