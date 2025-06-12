// (C) 2007-2019 GoodData Corporation
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants.js";
import { ScatterPlotWithMeasuresAndAttribute } from "./base.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const dataLabelScenarios = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ScatterPlotWithMeasuresAndAttribute, dataLabelCustomizer);

export default [dataLabelScenarios];
