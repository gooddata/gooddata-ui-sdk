// (C) 2007-2019 GoodData Corporation
import { action } from "@storybook/addon-actions";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newTotal } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src/index.js";
import {
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    PivotTableWithMeasuresAndRowsOnly,
    PivotTableWithMeasuresAndColumnOnly,
    getCommonPivotTableSizingConfig,
    PivotTableWithMeasuresAndColumnsOnly,
} from "./base.js";
import {
    AmountMeasurePredicate,
    WonMeasurePredicate,
    DepartmentPredicate,
    ProductPredicate,
    RegionPredicate,
} from "../_infra/predicates.js";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
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
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Department),
            newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Department),
            newTotal("nat", ReferenceMd.Won, ReferenceMd.Department),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region),
            newTotal("nat", ReferenceMd.Won, ReferenceMd.Region),
        ],
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department]),
            measureGroupDimension: "rows",
        },
    })
    .addScenario("multiple measures and no columns, with totals", {
        ...PivotTableWithMeasuresAndRowsOnly,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Department),
            newTotal("min", ReferenceMd.Won, ReferenceMd.Department),
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region),
            newTotal("nat", ReferenceMd.Won, ReferenceMd.Region),
        ],
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Region, ReferenceMd.Department]),
            measureGroupDimension: "rows",
        },
    })
    .addScenario("multiple measures and no rows, with totals", {
        ...PivotTableWithMeasuresAndColumnOnly,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Region),
            newTotal("med", ReferenceMd.Amount, ReferenceMd.Region),
            newTotal("med", ReferenceMd.Won, ReferenceMd.Region),
            newTotal("nat", ReferenceMd.Won, ReferenceMd.Region),
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
    });
