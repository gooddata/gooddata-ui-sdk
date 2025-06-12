// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../src/index.js";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import {
    PivotTableWithSingleColumn,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
} from "./base.js";
import { PivotTableWithTwoMeasuresGrandTotalsAndSubtotals } from "./totals.js";
import { requestPages } from "@gooddata/mock-handling";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("auto-resizing")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .withDefaultBackendSettings({
        enableTableColumnsAutoResizing: true,
        enableTableColumnsGrowToFit: true,
    })
    .addScenario("with column attributes only and auto-resizing", {
        ...PivotTableWithSingleColumn,
        config: {
            columnSizing: {
                defaultWidth: "autoresizeAll",
            },
        },
    })
    .addScenario(
        "with small page and auto-resizing",
        {
            ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
            config: {
                columnSizing: {
                    defaultWidth: "autoresizeAll",
                },
            },
            pageSize: 3,
        },
        (m) => m.withCustomDataCapture({ windows: requestPages([0, 0], [3, 1000], 10) }),
    )
    .addScenario("with two measures and row attribute with auto-resizing", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                defaultWidth: "autoresizeAll",
            },
        },
    })
    .addScenario("with two measures and row attribute with auto-resizing and grow to fit", {
        ...PivotTableWithTwoMeasuresAndSingleRowAttr,
        config: {
            columnSizing: {
                defaultWidth: "autoresizeAll",
                growToFit: true,
            },
        },
    })
    .addScenario("with two measures, grand totals and subtotals with auto-resizing", {
        ...PivotTableWithTwoMeasuresGrandTotalsAndSubtotals,
        config: {
            columnSizing: {
                defaultWidth: "autoresizeAll",
            },
        },
    })
    .addScenario("with two measures, grand totals and subtotals with auto-resizing and grow to fit", {
        ...PivotTableWithTwoMeasuresGrandTotalsAndSubtotals,
        config: {
            columnSizing: {
                defaultWidth: "autoresizeAll",
                growToFit: true,
            },
        },
    });
