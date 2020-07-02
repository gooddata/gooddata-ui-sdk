// (C) 2007-2019 GoodData Corporation
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { PivotTableSortingExample } from "./PivotTableSortingExample";
import PivotTableSortingExampleSRC from "!raw-loader!./PivotTableSortingExample";
import PivotTableSortingExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableSortingExample";
import { PivotTableTotalsExample } from "./PivotTableTotalsExample";
import PivotTableTotalsExampleSRC from "!raw-loader!./PivotTableTotalsExample";
import PivotTableTotalsExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableTotalsExample";
import { PivotTableRowGroupingExample } from "./PivotTableRowGroupingExample";
import PivotTableRowGroupingExampleSRC from "!raw-loader!./PivotTableRowGroupingExample";
import PivotTableRowGroupingExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableRowGroupingExample";
import { PivotTableSubtotalsExample } from "./PivotTableSubtotalsExample";
import PivotTableSubtotalsExampleSRC from "!raw-loader!./PivotTableSubtotalsExample";
import PivotTableSubtotalsExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableSubtotalsExample";
import { PivotTableDrillExample } from "./PivotTableDrillExample";
import PivotTableDrillExampleSRC from "!raw-loader!./PivotTableDrillExample";
import PivotTableDrillExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableDrillExample";
import { PivotTableSortingAggregationExample } from "./PivotTableSortingAggregationExample";
import PivotTableSortingAggregationExampleSRC from "!raw-loader!./PivotTableSortingAggregationExample";
import PivotTableSortingAggregationExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableSortingAggregationExample";
import { PivotTableSizingExample } from "./PivotTableSizingExample";
import PivotTableSizingExampleSRC from "!raw-loader!./PivotTableSizingExample";
import PivotTableSizingExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableSizingExample";
import { PivotTableColumnsGrowToFitExample } from "./PivotTableColumnsGrowToFitExample";
import PivotTableColumnsGrowToFitExampleSRC from "!raw-loader!./PivotTableColumnsGrowToFitExample";
import PivotTableColumnsGrowToFitExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableColumnsGrowToFitExample";
import PivotTableManualResizingExample from "./PivotTableManualResizingExample";
import PivotTableManualResizingExampleSRC from "!raw-loader!./PivotTableManualResizingExample";
import PivotTableManualResizingExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableManualResizingExample";
// import { PivotTableExample } from "./PivotTableExample";
// import PivotTableExampleSRC from "!raw-loader!./PivotTableExample";
// import PivotTableExampleSRCJS from "!raw-loader!../../../examplesJS/pivotTable/PivotTableExample";

export const PivotTable: React.FC = () => (
    <div>
        <h1>Pivot Table</h1>
        <hr className="separator" />
        <h2 id="measures-row-attributes-and-column-attributes">Example of Presorted Pivot Table</h2>
        <ExampleWithSource
            for={PivotTableSortingExample}
            source={PivotTableSortingExampleSRC}
            sourceJS={PivotTableSortingExampleSRCJS}
        />
        <hr className="separator" />
        <h2 id="measures-row-attributes-and-column-attributes">Example of Pivot Table with Totals</h2>
        <ExampleWithSource
            for={PivotTableTotalsExample}
            source={PivotTableTotalsExampleSRC}
            sourceJS={PivotTableTotalsExampleSRCJS}
        />
        <hr className="separator" />
        <h2 id="measures-row-attributes-and-column-attributes">Example of Drill Event</h2>
        <ExampleWithSource
            for={PivotTableDrillExample}
            source={PivotTableDrillExampleSRC}
            sourceJS={PivotTableDrillExampleSRCJS}
        />
        <hr className="separator" />
        <h2 id="measures-row-attributes-and-column-attributes">Example of rows grouping</h2>
        <ExampleWithSource
            for={PivotTableRowGroupingExample}
            source={PivotTableRowGroupingExampleSRC}
            sourceJS={PivotTableRowGroupingExampleSRCJS}
        />
        <hr className="separator" />
        <h2 id="measures-row-attributes-and-column-attributes">Example of subtotals</h2>
        <ExampleWithSource
            for={PivotTableSubtotalsExample}
            source={PivotTableSubtotalsExampleSRC}
            sourceJS={PivotTableSubtotalsExampleSRCJS}
        />
        <hr className="separator" />
        <h2 id="measures-row-attributes-and-column-attributes">Example of sort with aggregation</h2>
        <ExampleWithSource
            for={PivotTableSortingAggregationExample}
            source={PivotTableSortingAggregationExampleSRC}
            sourceJS={PivotTableSortingAggregationExampleSRCJS}
        />
        <hr className="separator" />
        <h2>Example of table column sizing</h2>
        <div id="table-with-column-sizing">
            <ExampleWithSource
                for={PivotTableSizingExample}
                source={PivotTableSizingExampleSRC}
                sourceJS={PivotTableSizingExampleSRCJS}
            />
        </div>
        <hr className="separator" />
        <h2 id="table-with-column-sizing">Example of table grow to fit container</h2>
        <ExampleWithSource
            for={PivotTableColumnsGrowToFitExample}
            source={PivotTableColumnsGrowToFitExampleSRC}
            sourceJS={PivotTableColumnsGrowToFitExampleSRCJS}
        />

        <h2 id="table-with-column-sizing">Example of pivot table with manual resizing</h2>
        <ExampleWithSource
            for={PivotTableManualResizingExample}
            source={PivotTableManualResizingExampleSRC}
            sourceJS={PivotTableManualResizingExampleSRCJS}
        />
    </div>
);

// const PivotTableWithAttributesWithMeasuresWithPivot: React.FC = () => (
//     <PivotTableExample
//         withAttributes
//         withMeasures
//         withPivot
//         className="s-measures-row-attributes-and-column-attributes"
//     />
// );

// const PivotTableWithMeasuresWithPivot: React.FC = () => (
//     <PivotTableExample withMeasures withPivot className="s-measures-and-column-attributes" />
// );

// const PivotTableWithAttributesWithMeasures: React.FC = () => (
//     <PivotTableExample withAttributes withMeasures className="s-measures-and-attributes" />
// );

// const PivotTableWithMeasures: React.FC = () => (
//     <PivotTableExample withMeasures className="s-measures-only" />
// );

// const PivotTableWithAttributes: React.FC = () => (
//     <PivotTableExample withAttributes className="s-row-attributes-only" />
// );

// const PivotTableWithError: React.FC = () => <PivotTableExample hasError className="s-error" />;

// export const PivotTable: React.FC = () => (
//     <div>
//         <h1>Pivot Table</h1>

//         <hr className="separator" />

//         <h2 id="measures-row-attributes-and-column-attributes">
//             Measures, row attributes and column attributes
//         </h2>
//         <ExampleWithSource
//             for={PivotTableWithAttributesWithMeasuresWithPivot}
//             source={PivotTableExampleSRC}
//         />

//         <hr className="separator" />

//         <h2 id="measures-and-column-attributes">Measures and column attributes</h2>
//         <ExampleWithSource for={PivotTableWithMeasuresWithPivot} source={PivotTableExampleSRC} />

//         <hr className="separator" />

//         <h2 id="measures-and-attributes">Measures and row attributes</h2>
//         <ExampleWithSource for={PivotTableWithAttributesWithMeasures} source={PivotTableExampleSRC} />

//         <hr className="separator" />

//         <h2 id="measures-only">Measures only</h2>
//         <ExampleWithSource for={PivotTableWithMeasures} source={PivotTableExampleSRC} />

//         <hr className="separator" />

//         <h2 id="row-attributes-only">Row attributes only</h2>
//         <ExampleWithSource for={PivotTableWithAttributes} source={PivotTableExampleSRC} />

//         <hr className="separator" />

//         <h2 id="error">Error</h2>
//         <ExampleWithSource for={PivotTableWithError} source={PivotTableExampleSRC} />
//     </div>
// );
