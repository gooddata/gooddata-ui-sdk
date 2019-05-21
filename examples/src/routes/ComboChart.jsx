// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";
import ComboChartExample from "../components/ComboChartExample";
import ComboChartExampleSRC from "!raw-loader!../components/ComboChartExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const ComboChart = () => (
    <div>
        <h1>Combo Chart</h1>
        <ExampleWithSource for={ComboChartExample} source={ComboChartExampleSRC} />
    </div>
);

export default ComboChart;
