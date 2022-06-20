// (C) 2007-2019 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttributeSort, newTotal } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { requestPages } from "@gooddata/mock-handling";
import { scenariosFor } from "../../src";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
} from "./base";

export const PivotTableWithTwoMeasuresAndTotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
    ],
};

export const PivotTableWithTwoMeasuresGrandTotalsAndSubtotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("min", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("max", ReferenceMd.Won, ReferenceMd.Product.Name),
        newTotal("nat", ReferenceMd.Won, ReferenceMd.Product.Name),
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department),
        newTotal("med", ReferenceMd.Amount, ReferenceMd.Department),
        newTotal("med", ReferenceMd.Won, ReferenceMd.Department),
        newTotal("nat", ReferenceMd.Won, ReferenceMd.Department),
    ],
};

export const PivotTableWithSingleMeasureAndGrandTotal = {
    ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
    totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("totals")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 600 } })
    .addScenario("single measure and single grand total", PivotTableWithSingleMeasureAndGrandTotal)
    .addScenario("single measure and multiple grand totals", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("max", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("nat", ReferenceMd.Amount, ReferenceMd.Product.Name),
        ],
    })
    .addScenario(
        "two measures and single grand total for one",
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)],
        },
        (m) => m.withCustomDataCapture({ windows: requestPages([0, 0], [22, 1000], 1) }),
    )
    .addScenario("two measures and single grand total for each", PivotTableWithTwoMeasuresAndTotals, (m) =>
        m.withCustomDataCapture({ windows: requestPages([0, 0], [22, 1000], 1) }),
    )
    .addScenario("two measures and multiple grand totals for each", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("max", ReferenceMd.Won, ReferenceMd.Product.Name),
            newTotal("nat", ReferenceMd.Won, ReferenceMd.Product.Name),
        ],
    })
    .addScenario(
        "two measures and one subtotal",
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department)],
        },
        (m) => m.withCustomDataCapture({ windows: requestPages([0, 0], [22, 1000], 1) }),
    )
    .addScenario("two measures and multiple subtotals", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Department),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Department),
            newTotal("nat", ReferenceMd.Won, ReferenceMd.Department),
        ],
    })
    .addScenario("two measures and grand totals and multiple subtotals", {
        ...PivotTableWithTwoMeasuresGrandTotalsAndSubtotals,
    })
    .addScenario(
        "two measures and single grand total sorted by second attribute",
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)],
            sortBy: [newAttributeSort(ReferenceMd.Department, "desc")],
        },
        (m) =>
            m.withCustomDataCapture({
                windows: [...requestPages([0, 0], [22, 1000], 1), ...requestPages([0, 0], [12, 1000], 1)],
            }),
    )
    .addScenario(
        "two measures and single grand total and single subtotal sorted by second attribute",
        // The expected behaviour is that the subtotal will be removed and the scenario will be reduced to
        // the scenario "two measures and single grand total sorted by second attribute"
        // The requested windows also get affected so the base scenario requires multiple recorded responses
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            totals: [
                newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
                newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department),
            ],
            sortBy: [newAttributeSort(ReferenceMd.Department, "desc")],
        },
    );
