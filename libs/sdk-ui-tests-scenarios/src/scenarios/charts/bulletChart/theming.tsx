// (C) 2021-2026 GoodData Corporation

import { BulletChart, type IBulletChartProps } from "@gooddata/sdk-ui-charts";

import { BulletChartWithAllMeasuresAndViewBy } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IBulletChartProps>("BulletChart", BulletChart)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", BulletChartWithAllMeasuresAndViewBy)
    .addScenario("font", BulletChartWithAllMeasuresAndViewBy, (m) => m.withTags("themed", "font"));
