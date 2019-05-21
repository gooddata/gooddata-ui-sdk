// (C) 2007-2019 GoodData Corporation
import React from "react";
import ExampleWithSource from "../components/utils/ExampleWithSource";
import PivotTableDrillExample from "../components/PivotTableDrillExample";
import PivotTableDrillExampleSRC from "!raw-loader!../components/PivotTableDrillExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const PivotTableDrillingDemo = () => (
    <div>
        <h1>Pivot Table Drilling</h1>

        <ExampleWithSource for={() => <PivotTableDrillExample />} source={PivotTableDrillExampleSRC} />
    </div>
);

export default PivotTableDrillingDemo;
