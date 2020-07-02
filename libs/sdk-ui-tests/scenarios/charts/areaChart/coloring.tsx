// (C) 2007-2019 GoodData Corporation
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";
import { AreaChartWithTwoMeasuresAndViewBy } from "./base";
import { coloringCustomizer } from "../_infra/coloringVariants";
import { AreaChart, IAreaChartProps } from "@gooddata/sdk-ui-charts";

export default scenariosFor<IAreaChartProps>("AreaChart", AreaChart)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withGroupNames("customization")
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", AreaChartWithTwoMeasuresAndViewBy, coloringCustomizer);
