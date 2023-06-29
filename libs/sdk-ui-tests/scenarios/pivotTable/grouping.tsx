// (C) 2007-2019 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src/index.js";

// this pivot table is such that if it is sorted by the measure, it has adjacent cells with the same content in the first column
// -> they would be grouped if the grouping was enabled no matter what
const PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure = {
    measures: [ReferenceMd.Amount],
    rows: [ReferenceMd.Department, ReferenceMd.Product.Name],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("grouping")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single measure pivot with grouping sorted by first row attr", {
        ...PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure,
        sortBy: [newAttributeSort(ReferenceMd.Department, "desc")],
    })
    .addScenario("single measure pivot with grouping sorted by second row attr", {
        ...PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("single measure pivot with grouping sorted by measure", {
        ...PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure,
        sortBy: [newMeasureSort(ReferenceMd.Amount, "desc")],
    });
