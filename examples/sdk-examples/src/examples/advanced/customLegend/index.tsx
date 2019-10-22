// (C) 2007-2019 GoodData Corporation
import React from "react";
import { ExampleWithSource } from "../../../components/ExampleWithSource";

import { CustomLegendExample } from "./CustomLegendExample";
import CustomLegendExampleSRC from "!raw-loader!./CustomLegendExample";

export const CustomLegend = () => (
    <div>
        <h1>Custom legend</h1>

        <p>
            You can access legend items via <code>onLegendReady</code> and render custom legend.
        </p>

        <ExampleWithSource for={CustomLegendExample} source={CustomLegendExampleSRC} />
    </div>
);
