// (C) 2021 GoodData Corporation
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { scenariosFor } from "../../src/index.js";
import { PivotTableWithSingleMeasureAndTwoRowsAndCols } from "./base.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .withDefaultTags("themed")
    .addScenario("themed", PivotTableWithSingleMeasureAndTwoRowsAndCols)
    .addScenario("font", PivotTableWithSingleMeasureAndTwoRowsAndCols, (m) => m.withTags("themed", "font"));
