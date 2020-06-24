// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../src";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { PivotTableWithSingleColumn, PivotTableWithTwoMeasuresAndSingleRowAttr } from "./base";
import { PivotTableWithTwoMeasuresGrandTotalsAndSubtotals } from "./totals";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("with column attributes only and auto-resizing", {
        ...PivotTableWithSingleColumn,
        config: {
            columnSizing: {
                defaultWidth: "viewport",
            },
        },
    })
    .addScenario("with small page and auto-resizing", {
        ...PivotTableWithSingleColumn,
        config: {
            columnSizing: {
                defaultWidth: "viewport",
            },
        },
        pageSize: 3,
    })
    .addScenario("with two measures and row attribute with auto-resizing", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                defaultWidth: "viewport",
            },
        },
    })
    .addScenario("with two measures and row attribute with auto-resizing and grow to fit", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                defaultWidth: "viewport",
                growToFit: true,
            },
        },
    })
    .addScenario("with two measures, grand totals and subtotals with auto-resizing", {
        ...PivotTableWithTwoMeasuresGrandTotalsAndSubtotals,
        config: {
            columnSizing: {
                defaultWidth: "viewport",
            },
        },
    })
    .addScenario("with two measures, grand totals and subtotals with auto-resizing and grow to fit", {
        ...PivotTableWithTwoMeasuresGrandTotalsAndSubtotals,
        config: {
            columnSizing: {
                defaultWidth: "viewport",
                growToFit: true,
            },
        },
    });
