// (C) 2023 GoodData Corporation
import { IDependencyWheelChartProps, DependencyWheelChart } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { DependencyWheelChartWithMeasureAttributeFromAndTo } from "./base.js";

export default scenariosFor<IDependencyWheelChartProps>("DependencyWheelChart", DependencyWheelChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", DependencyWheelChartWithMeasureAttributeFromAndTo)
    .addScenario("font", DependencyWheelChartWithMeasureAttributeFromAndTo, (m) =>
        m.withTags("themed", "font"),
    );
