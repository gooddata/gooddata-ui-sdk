// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newMeasureSort } from "@gooddata/sdk-model";
import { type IPivotTableNextProps, PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

import { PivotTableWithTwoMeasuresAndSingleRowAttr, getCommonPivotTableSizingConfig } from "./base.js";
import { scenariosFor } from "../../src/index.js";

// todo: some scenarios were commented out during neobackstop creation, make an option to disable only their adding to 04

export const sorting = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("sorting")
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    // .addScenario("single measure pivot sorted by first row attr", {
    //     ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
    //     sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    //     config: getCommonPivotTableSizingConfig(PivotTableWithSingleMeasureAndTwoRowsAndCols.rows),
    // })
    // .addScenario("single measure pivot sorted by second row attr", {
    //     ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
    //     sortBy: [newAttributeSort(ReferenceMd.Department.Default, "desc")],
    //     config: getCommonPivotTableSizingConfig(PivotTableWithSingleMeasureAndTwoRowsAndCols.rows),
    // })
    .addScenario("two measures with single row attr sorted by first measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Amount, "desc")],
        config: getCommonPivotTableSizingConfig(PivotTableWithTwoMeasuresAndSingleRowAttr.rows),
    })
    .addScenario("two measures with single row attr sorted by second measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Won, "desc")],
        config: getCommonPivotTableSizingConfig(PivotTableWithTwoMeasuresAndSingleRowAttr.rows),
    });
// .addScenario("single measure pivot sorted by first and second row attr", {
//     ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
//     sortBy: [
//         newAttributeSort(ReferenceMd.Product.Name, "asc"),
//         newAttributeSort(ReferenceMd.Department.Default, "desc"),
//     ],
//     config: getCommonPivotTableSizingConfig(PivotTableWithSingleMeasureAndTwoRowsAndCols.rows),
// });
