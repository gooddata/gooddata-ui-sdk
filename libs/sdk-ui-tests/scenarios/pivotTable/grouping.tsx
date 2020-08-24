// (C) 2007-2019 GoodData Corporation

import { ReferenceLdm } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src";

// this pivot table is such that if it is sorted by the measure, it has adjacent cells with the same content in the first column
// -> they would be grouped if the grouping was enabled no matter what
const PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure = {
    measures: [ReferenceLdm.Amount],
    rows: [ReferenceLdm.Department, ReferenceLdm.Product.Name],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("grouping")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single measure pivot with grouping sorted by first row attr", {
        ...PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure,
        sortBy: [newAttributeSort(ReferenceLdm.Department, "desc")],
    })
    .addScenario("single measure pivot with grouping sorted by second row attr", {
        ...PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure,
        sortBy: [newAttributeSort(ReferenceLdm.Product.Name, "desc")],
    })
    .addScenario("single measure pivot with grouping sorted by measure", {
        ...PivotTableWithMeasureAndTwoAttributesThatHasAdjacentCellsWhenSortedByMeasure,
        sortBy: [newMeasureSort(ReferenceLdm.Amount, "desc")],
    });
