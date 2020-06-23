// (C) 2007-2019 GoodData Corporation

import { ReferenceLdm } from "@gooddata/reference-workspace";
import { newTotal } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
} from "./base";

export const PivotTableWithTwoMeasuresAndTotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
        newTotal("sum", ReferenceLdm.Won, ReferenceLdm.Product.Name),
    ],
};

export const PivotTableWithTwoMeasuresGrandTotalsAndSubtotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
        newTotal("min", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
        newTotal("max", ReferenceLdm.Won, ReferenceLdm.Product.Name),
        newTotal("nat", ReferenceLdm.Won, ReferenceLdm.Product.Name),
        newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Department),
        newTotal("med", ReferenceLdm.Amount, ReferenceLdm.Department),
        newTotal("med", ReferenceLdm.Won, ReferenceLdm.Department),
        newTotal("nat", ReferenceLdm.Won, ReferenceLdm.Department),
    ],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 600 } })
    .addScenario("single measure and single grand total", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        totals: [newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Product.Name)],
    })
    .addScenario("single measure and multiple grand totals", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
            newTotal("min", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
            newTotal("max", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
            newTotal("nat", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
        ],
    })
    .addScenario("two measures and single grand total for each", PivotTableWithTwoMeasuresAndTotals)
    .addScenario("two measures and multiple grand totals for each", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
            newTotal("min", ReferenceLdm.Amount, ReferenceLdm.Product.Name),
            newTotal("max", ReferenceLdm.Won, ReferenceLdm.Product.Name),
            newTotal("nat", ReferenceLdm.Won, ReferenceLdm.Product.Name),
        ],
    })
    .addScenario("two measures and multiple subtotals", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceLdm.Amount, ReferenceLdm.Department),
            newTotal("med", ReferenceLdm.Amount, ReferenceLdm.Department),
            newTotal("med", ReferenceLdm.Won, ReferenceLdm.Department),
            newTotal("nat", ReferenceLdm.Won, ReferenceLdm.Department),
        ],
    })
    .addScenario("two measures and grand totals and multiple subtotals", {
        ...PivotTableWithTwoMeasuresGrandTotalsAndSubtotals,
    });
