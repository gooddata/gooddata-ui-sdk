// (C) 2007-2019 GoodData Corporation
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { ScatterPlotWithMeasuresAndAttribute } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

const dataLabelScenarios = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ScatterPlotWithMeasuresAndAttribute, dataLabelCustomizer);

export default [dataLabelScenarios];
