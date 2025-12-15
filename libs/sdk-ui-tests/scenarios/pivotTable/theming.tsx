// (C) 2021-2025 GoodData Corporation

import { type IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";

import { PivotTableWithSingleMeasureAndTwoRowsAndCols } from "./base.js";
import { scenariosFor } from "../../src/index.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

export const theming = scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withVisualTestConfig({
        screenshotSize: { width: 1000, height: 800 },
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        misMatchThreshold: 0.01,
    })
    .withDefaultTags("themed")
    .addScenario("themed", PivotTableWithSingleMeasureAndTwoRowsAndCols)
    .addScenario("font", PivotTableWithSingleMeasureAndTwoRowsAndCols, (m) => m.withTags("themed", "font"));
