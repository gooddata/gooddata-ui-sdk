// (C) 2007-2025 GoodData Corporation

import { requestPages } from "@gooddata/mock-handling";
import { IPivotTableNextProps, PivotTableNext } from "@gooddata/sdk-ui-pivot/next";

import {
    PivotTableWithSingleColumn,
    PivotTableWithSingleMeasureAndTwoRowsAndCols,
    PivotTableWithTwoMeasuresAndSingleRowAttr,
} from "./base.js";
import { PivotTableWithTwoMeasuresGrandTotalsAndSubtotals } from "./totals.js";
import { scenariosFor } from "../../src/index.js";

export default scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames("auto-resizing")
    .withVisualTestConfig({
        screenshotSize: {
            width: 1200,
            height: 800,
        },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
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
            // pageSize: 3,
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
