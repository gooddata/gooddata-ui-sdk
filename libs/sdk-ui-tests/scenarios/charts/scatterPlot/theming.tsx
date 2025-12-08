// (C) 2021-2025 GoodData Corporation

import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";

import { ScatterPlotWithMeasuresAndAttribute } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ScatterPlotWithMeasuresAndAttribute)
    .addScenario("font", ScatterPlotWithMeasuresAndAttribute, (m) => m.withTags("themed", "font"));
