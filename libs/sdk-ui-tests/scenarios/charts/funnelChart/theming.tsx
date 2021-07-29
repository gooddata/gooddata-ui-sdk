// (C) 2021 GoodData Corporation
import { FunnelChart, IFunnelChartProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { FunnelChartWithMeasureAndViewBy } from "./base";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IFunnelChartProps>("FunnelChart", FunnelChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", FunnelChartWithMeasureAndViewBy)
    .addScenario("font", FunnelChartWithMeasureAndViewBy, (m) => m.withTags("themed", "font"));
