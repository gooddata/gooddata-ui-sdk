// (C) 2023-2025 GoodData Corporation

import { DependencyWheelChart, IDependencyWheelChartProps } from "@gooddata/sdk-ui-charts";

import { DependencyWheelChartWithMeasureAttributeFromAndTo } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IDependencyWheelChartProps>("DependencyWheelChart", DependencyWheelChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", DependencyWheelChartWithMeasureAttributeFromAndTo)
    .addScenario("font", DependencyWheelChartWithMeasureAttributeFromAndTo, (m) =>
        m.withTags("themed", "font"),
    );
