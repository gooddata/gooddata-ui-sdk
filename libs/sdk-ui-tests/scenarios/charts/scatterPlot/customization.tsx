// (C) 2007-2019 GoodData Corporation
import { IScatterPlotProps, ScatterPlot } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { dataLabelCustomizer } from "../_infra/dataLabelVariants";
import { ScatterPlotWithMeasuresAndAttribute } from "./base";

const dataLabelScenarios = scenariosFor<IScatterPlotProps>("ScatterPlot", ScatterPlot)
    .withVisualTestConfig({ groupUnder: "data labels" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("data labels", ScatterPlotWithMeasuresAndAttribute, dataLabelCustomizer);

export default [dataLabelScenarios];
