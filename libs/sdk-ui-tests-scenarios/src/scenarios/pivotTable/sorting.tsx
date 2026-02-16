// (C) 2007-2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttributeSort, newMeasureSort } from "@gooddata/sdk-model";
import { type IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";

import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
} from "./base.js";
import { scenariosFor } from "../../scenarioGroup.js";

export const sorting = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("sorting")
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .addScenario("single measure pivot sorted by first row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
    })
    .addScenario("single measure pivot sorted by second row attr", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        sortBy: [newAttributeSort(ReferenceMd.Department.Default, "desc")],
    })
    .addScenario("two measures with single row attr sorted by first measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Amount, "desc")],
    })
    .addScenario("two measures with single row attr sorted by second measure", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        sortBy: [newMeasureSort(ReferenceMd.Won, "desc")],
    });
