// (C) 2007-2022 GoodData Corporation
/* eslint-disable import/no-unresolved,import/default */
import React from "react";

import { ExampleWithSource } from "../../components/ExampleWithSource";
import { PivotTableSortingExample } from "./PivotTableSortingExample";
import PivotTableSortingExampleSRC from "./PivotTableSortingExample?raw";
import PivotTableSortingExampleSRCJS from "./PivotTableSortingExample?rawJS";
import { PivotTableTotalsExample } from "./PivotTableTotalsExample";
import PivotTableTotalsExampleSRC from "./PivotTableTotalsExample?raw";
import PivotTableTotalsExampleSRCJS from "./PivotTableTotalsExample?rawJS";
import { PivotTableRowGroupingExample } from "./PivotTableRowGroupingExample";
import PivotTableRowGroupingExampleSRC from "./PivotTableRowGroupingExample?raw";
import PivotTableRowGroupingExampleSRCJS from "./PivotTableRowGroupingExample?rawJS";
import { PivotTableSubtotalsExample } from "./PivotTableSubtotalsExample";
import PivotTableSubtotalsExampleSRC from "./PivotTableSubtotalsExample?raw";
import PivotTableSubtotalsExampleSRCJS from "./PivotTableSubtotalsExample?rawJS";
import { PivotTableDrillExample } from "./PivotTableDrillExample";
import PivotTableDrillExampleSRC from "./PivotTableDrillExample?raw";
import PivotTableDrillExampleSRCJS from "./PivotTableDrillExample?rawJS";
import { PivotTableSortingAggregationExample } from "./PivotTableSortingAggregationExample";
import PivotTableSortingAggregationExampleSRC from "./PivotTableSortingAggregationExample?raw";
import PivotTableSortingAggregationExampleSRCJS from "./PivotTableSortingAggregationExample?rawJS";
import { PivotTableSizingExample } from "./PivotTableSizingExample";
import PivotTableSizingExampleSRC from "./PivotTableSizingExample?raw";
import PivotTableSizingExampleSRCJS from "./PivotTableSizingExample?rawJS";
import { PivotTableColumnsGrowToFitExample } from "./PivotTableColumnsGrowToFitExample";
import PivotTableColumnsGrowToFitExampleSRC from "./PivotTableColumnsGrowToFitExample?raw";
import PivotTableColumnsGrowToFitExampleSRCJS from "./PivotTableColumnsGrowToFitExample?rawJS";
import PivotTableManualResizingExample from "./PivotTableManualResizingExample";
import PivotTableManualResizingExampleSRC from "./PivotTableManualResizingExample?raw";
import PivotTableManualResizingExampleSRCJS from "./PivotTableManualResizingExample?rawJS";

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
