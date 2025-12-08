// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { modifyMeasure } from "@gooddata/sdk-model";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";

import { PivotTableWithSingleMeasureAndTwoRowsAndCols } from "./base.js";
import { PivotTableWithSingleMeasureAndGrandTotal, PivotTableWithTwoMeasuresAndTotals } from "./totals.js";
import { scenariosFor } from "../../src/index.js";
import { GermanNumberFormat } from "../_infra/formatting.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

const MeasureWithCustomFormat = modifyMeasure(ReferenceMd.Amount, (m) =>
    m.format("[backgroundColor=ffff00][green]#,##0.00 €").defaultLocalId(),
);

export const customization = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("german number format", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: {
            separators: GermanNumberFormat,
        },
    })
    .addScenario("no totals and max height 200", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: {
            maxHeight: 200,
        },
    })
    .addScenario("no totals and max height 300", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: {
            maxHeight: 300,
        },
    })
    .addScenario("no totals and no grouping", {
        ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
        config: { groupRows: false },
    })
    .addScenario(
        "measure format with colors",
        {
            ...PivotTableWithSingleMeasureAndTwoRowsAndCols,
            measures: [MeasureWithCustomFormat],
            config: { groupRows: false },
        },
        (m) => {
            // measure formatting needs to be looped through backend.. thus clearing up the vis-config-only flag to
            // make sure recording will be captured
            return m.withTags("mock-no-scenario-meta");
        },
    )
    .addScenario("totals and max height 200", {
        ...PivotTableWithTwoMeasuresAndTotals,
        config: {
            maxHeight: 200,
        },
    })
    .addScenario("totals and max height 300", {
        ...PivotTableWithTwoMeasuresAndTotals,
        config: {
            maxHeight: 300,
        },
    })
    .addScenario("totals and max height 800", {
        ...PivotTableWithSingleMeasureAndGrandTotal,
        config: {
            maxHeight: 800,
        },
    });
