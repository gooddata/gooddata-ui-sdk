// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { IPivotTableNextProps, PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    getCommonPivotTableSizingConfig,
} from "./base.js";
import { scenariosFor } from "../../src/index.js";

export default scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("sorting")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single measure pivot sorted by first row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
        config: getCommonPivotTableSizingConfig(PivotTableWithSingleMeasureAndTwoRowsAndCols.rows),
    })
    .addScenario("single measure pivot sorted by second row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [newAttributeSort(ReferenceMd.Department.Default, "desc")],
        config: getCommonPivotTableSizingConfig(PivotTableWithSingleMeasureAndTwoRowsAndCols.rows),
    })
    .addScenario("two measures with single row attr sorted by first measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Amount, "desc")],
        config: getCommonPivotTableSizingConfig(PivotTableWithTwoMeasuresAndSingleRowAttr.rows),
    })
    .addScenario("two measures with single row attr sorted by second measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Won, "desc")],
        config: getCommonPivotTableSizingConfig(PivotTableWithTwoMeasuresAndSingleRowAttr.rows),
    })
    .addScenario("single measure pivot sorted by first and second row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [
            newAttributeSort(ReferenceMd.Product.Name, "asc"),
            newAttributeSort(ReferenceMd.Department.Default, "desc"),
        ],
        config: getCommonPivotTableSizingConfig(PivotTableWithSingleMeasureAndTwoRowsAndCols.rows),
    });
