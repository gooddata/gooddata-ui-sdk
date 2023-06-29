// (C) 2021 GoodData Corporation
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScatterPlotWithMeasuresAndAttribute } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", ScatterPlotWithMeasuresAndAttribute)
    .addScenario("font", ScatterPlotWithMeasuresAndAttribute, (m) => m.withTags("themed", "font"));
