// (C) 2007-2019 GoodData Corporation
import React from "react";

import ExampleWithSource from "../components/utils/ExampleWithSource";
import PivotTableDrillExample from "../components/PivotTableDrillExample";
import PivotTableDrillExampleSRC from "!raw-loader!../components/PivotTableDrillExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PivotTableSortingExample from "../components/PivotTableSortingExample";
import PivotTableSortingExampleSRC from "!raw-loader!../components/PivotTableSortingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PivotTableTotalsExample from "../components/PivotTableTotalsExample";
import PivotTableTotalsExampleSRC from "!raw-loader!../components/PivotTableTotalsExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PivotTableRowGroupingExample from "../components/PivotTableRowGroupingExample";
import PivotTableRowGroupingExampleSRC from "!raw-loader!../components/PivotTableRowGroupingExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first
import PivotTableSubtotalsExample from "../components/PivotTableSubtotalsExample";
import PivotTableSubtotalsExampleSRC from "!raw-loader!../components/PivotTableSubtotalsExample"; // eslint-disable-line import/no-webpack-loader-syntax, import/no-unresolved, import/extensions, import/first

export const PivotTableDemo = () => (
    <div>
        <h1>Pivot Table</h1>

        <hr className="separator" />

        <h2 id="measures-row-attributes-and-column-attributes">Example of Presorted Pivot Table</h2>
        <ExampleWithSource for={() => <PivotTableSortingExample />} source={PivotTableSortingExampleSRC} />

        <hr className="separator" />

        <h2 id="measures-row-attributes-and-column-attributes">Example of Pivot Table with Totals</h2>
        <ExampleWithSource for={() => <PivotTableTotalsExample />} source={PivotTableTotalsExampleSRC} />

        <hr className="separator" />

        <h2 id="measures-row-attributes-and-column-attributes">Example of Drill Event</h2>
        <ExampleWithSource for={() => <PivotTableDrillExample />} source={PivotTableDrillExampleSRC} />

        <hr className="separator" />

        <h2 id="measures-row-attributes-and-column-attributes">Example of rows grouping</h2>
        <ExampleWithSource
            for={() => <PivotTableRowGroupingExample />}
            source={PivotTableRowGroupingExampleSRC}
        />

        <h2 id="measures-row-attributes-and-column-attributes">Example of subtotals</h2>
        <ExampleWithSource
            for={() => <PivotTableSubtotalsExample />}
            source={PivotTableSubtotalsExampleSRC}
        />
    </div>
);

export default PivotTableDemo;
