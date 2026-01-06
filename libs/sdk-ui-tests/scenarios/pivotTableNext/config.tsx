// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyAttribute, newTotal } from "@gooddata/sdk-model";
import {
    type IPivotTableNextProps,
    PivotTableNext,
    newWidthForAttributeColumn,
} from "@gooddata/sdk-ui-pivot/next";

import {
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    getCommonPivotTableSizingConfig,
} from "./base.js";
import { scenariosFor } from "../../src/index.js";

// Attribute with long alias to demonstrate header wrapping
const ProductNameWithLongAlias = modifyAttribute(ReferenceMd.Product.Name, (m) =>
    m.alias("Product Name With Very Long Title For Wrapping"),
);

// =============================================================================
// Text Wrapping Scenarios
// =============================================================================

const textWrapping = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("config", "text wrapping")
    .withDefaultTags("no-plug-viz-tests")
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .addScenario("cell text wrapping enabled", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        rows: [ProductNameWithLongAlias],
        config: {
            columnSizing: {
                columnWidths: [newWidthForAttributeColumn(ProductNameWithLongAlias, 60)],
                defaultWidth: "unset",
                growToFit: false,
            },
            textWrapping: {
                wrapText: true,
            },
        },
    })
    .addScenario("header text wrapping enabled", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        rows: [ProductNameWithLongAlias],
        config: {
            columnSizing: {
                columnWidths: [newWidthForAttributeColumn(ProductNameWithLongAlias, 60)],
                defaultWidth: "unset",
                growToFit: false,
            },
            textWrapping: {
                wrapHeaderText: true,
            },
        },
    });

// =============================================================================
// Pagination Scenarios
// =============================================================================

const pagination = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("config", "pagination")
    .withDefaultTags("no-plug-viz-tests")
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .addScenario("pagination with 5 rows per page", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            enablePivotTablePagination: true,
            pagination: {
                enabled: true,
            },
        },
        pageSize: 5,
    })
    .addScenario("pagination with 5 rows per page and totals", {
        ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        totals: [
            newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
            newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
        ],
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            enablePivotTablePagination: true,
            pagination: {
                enabled: true,
            },
        },
        pageSize: 5,
    });

// =============================================================================
// Grand Totals Position Scenarios
// =============================================================================

const PivotTableWithGrandTotals = {
    ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    totals: [
        newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name),
        newTotal("sum", ReferenceMd.Won, ReferenceMd.Product.Name),
    ],
};

const grandTotalsPosition = scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("config", "grand totals position")
    .withDefaultTags("no-plug-viz-tests")
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 600 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .addScenario("grand totals pinned at bottom (default)", {
        ...PivotTableWithGrandTotals,
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            grandTotalsPosition: "pinnedBottom",
        },
    })
    .addScenario("grand totals pinned at top", {
        ...PivotTableWithGrandTotals,
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            grandTotalsPosition: "pinnedTop",
        },
    })
    .addScenario("grand totals at bottom (not pinned)", {
        ...PivotTableWithGrandTotals,
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            grandTotalsPosition: "bottom",
        },
    })
    .addScenario("grand totals at top (not pinned)", {
        ...PivotTableWithGrandTotals,
        config: {
            ...getCommonPivotTableSizingConfig([ReferenceMd.Product.Name, ReferenceMd.Department.Default]),
            grandTotalsPosition: "top",
        },
    });

export const config = [textWrapping, pagination, grandTotalsPosition];
