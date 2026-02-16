// (C) 2024-2026 GoodData Corporation

import { type IRepeaterProps, Repeater } from "@gooddata/sdk-ui-charts";

import { RepeaterWithOneAttributeAndInlineVisualisation } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", RepeaterWithOneAttributeAndInlineVisualisation)
    .addScenario("font", RepeaterWithOneAttributeAndInlineVisualisation, (m) => m.withTags("themed", "font"));
