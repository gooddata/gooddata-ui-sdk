// (C) 2007-2025 GoodData Corporation

import { requestPages } from "@gooddata/mock-handling";
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    newAttributeSort,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newTotal,
} from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";

import {
    PivotTableWighSingleMeasureAndSingleRowColAttr,
    PivotTableWighTwoMeasureAndSingleRowColAttr,
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    getCommonPivotTableSizingConfig,
} from "./base.js";
import { scenariosFor } from "../../src/index.js";

export const PivotTableWithTwoMeasuresAndTotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
    ],
    config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name]),
};

export const PivotTableWithTwoMeasuresGrandTotalsAndSubtotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("min", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("max", ReferenceMd.Won, ReferenceMd.Product.Name),
        // newTotal("nat", ReferenceMd.Won, ReferenceMd.Product.Name),
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
        newTotal("med", ReferenceMd.Amount, ReferenceMd.Department.Default),
        newTotal("med", ReferenceMd.Won, ReferenceMd.Department.Default),
        // newTotal("nat", ReferenceMd.Won, ReferenceMd.Department.Default),
    ],
    config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
};

export const PivotTableWithTwoMeasuresColumnGrandTotalsAndSubtotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        newTotal("min", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        newTotal("max", ReferenceMd.Won, ReferenceMd.ForecastCategory),
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
        newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
        newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
    ],
    config: getCommonPivotTableSizingConfig(),
};

export const PivotTableWithTwoMeasuresRowColumnGrandTotalsAndSubtotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("min", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("max", ReferenceMd.Won, ReferenceMd.Product.Name),
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
        newTotal("med", ReferenceMd.Amount, ReferenceMd.Department.Default),
        newTotal("med", ReferenceMd.Won, ReferenceMd.Department.Default),

        newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        newTotal("min", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        newTotal("max", ReferenceMd.Won, ReferenceMd.ForecastCategory),
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
        newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
        newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
    ],
    config: getCommonPivotTableSizingConfig(),
};

export const PivotTableWithSingleMeasureAndGrandTotal = {
    ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
    totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)],
    config: getCommonPivotTableSizingConfig(),
};

export const PivotTableWithSingleMeasureAndColumnGrandTotal = {
    ...PivotTableWighSingleMeasureAndSingleRowColAttr,
    totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory)],
    config: getCommonPivotTableSizingConfig(),
};

export const PivotTableWithSingleMeasureAndRowColumnGrandTotal = {
    ...PivotTableWighSingleMeasureAndSingleRowColAttr,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
    ],
    config: getCommonPivotTableSizingConfig(),
};

const totalsForRows = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("totals", "rows")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 600 } })
    .addScenario("single measure and single grand total", PivotTableWithSingleMeasureAndGrandTotal)
    .addScenario("single measure and multiple grand totals", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("max", ReferenceMd.Amount, ReferenceMd.Product.Name),
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
        ],
    })
    .addScenario(
        "two measures and one subtotal",
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default)],
        },
        (m) => m.withCustomDataCapture({ windows: requestPages([0, 0], [22, 1000], 1) }),
    )
    .addScenario("two measures and multiple subtotals", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Department.Default),
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
            sortBy: [newAttributeSort(ReferenceMd.Department.Default, "desc")],
        },
        (m) =>
            m.withCustomDataCapture({
                windows: [...requestPages([0, 0], [22, 1000], 1), ...requestPages([0, 0], [12, 1000], 1)],
            }),
    );

const totalsForColumns = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("totals", "columns")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 600 } })
    .addScenario("single measure and single column grand total", {
        ...PivotTableWithSingleMeasureAndColumnGrandTotal,
        config: getCommonPivotTableSizingConfig([ReferenceMd.SalesRep.Default]),
    })
    .addScenario("single measure and multiple column grand totals", {
        ...PivotTableWighSingleMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("max", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig(),
    })
    .addScenario("two measures and single column grand total for one", {
        ...PivotTableWighTwoMeasureAndSingleRowColAttr,
        totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory)],
        filters: [newNegativeAttributeFilter(ReferenceMd.ForecastCategory, ["Include"])],
        config: getCommonPivotTableSizingConfig(),
    })
    .addScenario("two measures and single column grand total for each", {
        ...PivotTableWighTwoMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("max", ReferenceMd.Probability, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig(),
    })
    .addScenario("two measures and multiple column grand totals for each", {
        ...PivotTableWighTwoMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("max", ReferenceMd.Probability, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig([ReferenceMd.SalesRep.Default]),
    })
    .addScenario("two measures and one column subtotal", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default)],
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    })
    .addScenario("two measures and multiple column subtotals", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
        ],
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, ["West Coast"])],
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    })
    .addScenario("two measures and column grand totals and multiple subtotals", {
        ...PivotTableWithTwoMeasuresColumnGrandTotalsAndSubtotals,
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, ["West Coast"])],
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    })
    .addScenario("two measures and column single grand total sorted by second attribute", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory)],
        sortBy: [newAttributeSort(ReferenceMd.Department.Default, "desc")],
        filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, ["West Coast"])],
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    })
    .addScenario(
        "two measures and single column grand total and single subtotal sorted by second attribute",
        // The expected behaviour is that the subtotal will be removed and the scenario will be reduced to
        // the scenario "two measures and single grand total sorted by second attribute"
        // The requested windows also get affected so the base scenario requires multiple recorded responses
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            totals: [
                newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
                newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            ],
            sortBy: [newAttributeSort(ReferenceMd.Department.Default, "desc")],
            filters: [newPositiveAttributeFilter(ReferenceMd.Region.Default, ["West Coast"])],
            config: getCommonPivotTableSizingConfig([
                ReferenceMd.Product.Name,
                ReferenceMd.Department.Default,
            ]),
        },
    );

const totalsForRowsAndColumns = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("totals", "rows & columns")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 600 } })
    .addScenario(
        "single measure and single column/row grand total",
        PivotTableWithSingleMeasureAndRowColumnGrandTotal,
    )
    .addScenario("single measure and multiple column/row grand totals", {
        ...PivotTableWighSingleMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig(),
    })
    .addScenario("two measures and single column/row grand total for one", {
        ...PivotTableWighTwoMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig(),
    })
    .addScenario("two measures and single column/row grand total for each", {
        ...PivotTableWighTwoMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
            newTotal("max", ReferenceMd.Probability, ReferenceMd.SalesRep.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("max", ReferenceMd.Probability, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig(),
    })
    .addScenario("two measures and multiple column/row grand totals for each", {
        ...PivotTableWighTwoMeasureAndSingleRowColAttr,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.SalesRep.Default),
            newTotal("max", ReferenceMd.Probability, ReferenceMd.SalesRep.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("min", ReferenceMd.Amount, ReferenceMd.ForecastCategory),
            newTotal("max", ReferenceMd.Probability, ReferenceMd.ForecastCategory),
        ],
        config: getCommonPivotTableSizingConfig([ReferenceMd.SalesRep.Default]),
    })
    .addScenario("two measures and one column/row subtotal", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
        ],
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    })
    .addScenario("two measures and multiple column/row subtotals", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
        ],
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    })
    .addScenario("two measures and column/row grand totals and multiple subtotals", {
        ...PivotTableWithTwoMeasuresRowColumnGrandTotalsAndSubtotals,
        config: getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
    });

export default [totalsForRows, totalsForColumns, totalsForRowsAndColumns];
