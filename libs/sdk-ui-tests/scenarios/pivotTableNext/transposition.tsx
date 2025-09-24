// (C) 2007-2025 GoodData Corporation

// import { action } from "@storybook/addon-actions";
import { action } from "storybook/internal/actions";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { newTotal } from "@gooddata/sdk-model";
import { IPivotTableNextProps, PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

import {
    PivotTableWithMeasuresAndColumnOnly,
    PivotTableWithMeasuresAndColumnsOnly,
    PivotTableWithMeasuresAndRowsOnly,
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    getCommonPivotTableSizingConfig,
} from "./base.js";
import { scenariosFor } from "../../src/index.js";
import {
    AmountMeasurePredicate,
    DepartmentPredicate,
    ProductPredicate,
    RegionPredicate,
    WonMeasurePredicate,
} from "../_infra/predicates.js";

export default scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("transposition")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .withDefaultBackendSettings({
        enablePivotTableTransposition: true,
        enableColumnHeadersPosition: true,
    })
    .addScenario("single measure pivot with both attributes and metrics in rows", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: {
            measureGroupDimension: "rows",
        },
    })
    .addScenario("two measures with single row attr with metrics in rows", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            measureGroupDimension: "rows",
        },
    })
    .addScenario("two measures and multiple column/row subtotals with metrics in rows", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Department.Default),
            // newTotal("nat", ReferenceMd.Won, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
            // newTotal("nat", ReferenceMd.Won, ReferenceMd.Region.Default),
        ],
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            measureGroupDimension: "rows",
        },
    })
    .addScenario("multiple measures and no columns, with totals", {
        ...PivotTableWithMeasuresAndRowsOnly,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("min", ReferenceMd.Won, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
            // newTotal("nat", ReferenceMd.Won, ReferenceMd.Region.Default),
        ],
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Region.Default, ReferenceMd.Department.Default]),
            measureGroupDimension: "rows",
        },
    })
    .addScenario("multiple measures and no rows, with totals", {
        ...PivotTableWithMeasuresAndColumnOnly,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
            // newTotal("nat", ReferenceMd.Won, ReferenceMd.Region.Default),
        ],
        config: {
            measureGroupDimension: "rows",
        },
    })
    .addScenario("multiple measures and row attributes with metrics in rows, with drilling", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        config: {
            measureGroupDimension: "rows",
        },
        drillableItems: [ProductPredicate, DepartmentPredicate, AmountMeasurePredicate, WonMeasurePredicate],
        onDrill: action("onDrill"),
    })
    .addScenario("two measures in rows and only column attrs on left", {
        ...PivotTableWithMeasuresAndColumnsOnly,
        config: {
            measureGroupDimension: "rows",
            columnHeadersPosition: "left",
        },
    })
    .addScenario("two measures in rows and only column attrs on left, with drilling", {
        ...PivotTableWithMeasuresAndColumnsOnly,
        config: {
            measureGroupDimension: "rows",
            columnHeadersPosition: "left",
        },
        drillableItems: [DepartmentPredicate, RegionPredicate, AmountMeasurePredicate, WonMeasurePredicate],
        onDrill: action("onDrill"),
    })
    .addScenario("two measures in rows and column attrs on top, with invalid drilling on attributes", {
        ...PivotTableWithMeasuresAndColumnsOnly,
        config: {
            measureGroupDimension: "rows",
            columnHeadersPosition: "top",
        },
        drillableItems: [DepartmentPredicate, RegionPredicate],
        onDrill: action("onDrill"),
    })
    .addScenario("two measures in rows and column attrs on top, with drilling on metrics", {
        ...PivotTableWithMeasuresAndColumnsOnly,
        config: {
            measureGroupDimension: "rows",
            columnHeadersPosition: "top",
        },
        drillableItems: [AmountMeasurePredicate, WonMeasurePredicate],
        onDrill: action("onDrill"),
    })
    .addScenario("two measures in rows and column attrs on left, with totals", {
        ...PivotTableWithMeasuresAndColumnsOnly,
        config: {
            measureGroupDimension: "rows",
            columnHeadersPosition: "left",
            columnSizing: {
                defaultWidth: "autoresizeAll",
            },
        },
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department.Default),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
        ],
    })
    .addScenario("two measures in rows and only column attrs on left, with totals", {
        ...PivotTableWithMeasuresAndColumnOnly,
        config: {
            measureGroupDimension: "rows",
            columnHeadersPosition: "left",
        },
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region.Default),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region.Default),
            // newTotal("nat", ReferenceMd.Won, ReferenceMd.Region.Default),
        ],
    });
