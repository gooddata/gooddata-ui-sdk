// (C) 2007-2019 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src/index.js";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
} from "./base.js";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("sorting")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single measure pivot sorted by first row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("single measure pivot sorted by second row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [newAttributeSort(ReferenceMd.Department, "desc")],
    })
    .addScenario("two measures with single row attr sorted by first measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Amount, "desc")],
    })
    .addScenario("two measures with single row attr sorted by second measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Won, "desc")],
    });
