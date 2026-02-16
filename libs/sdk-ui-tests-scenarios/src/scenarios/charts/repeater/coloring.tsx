// (C) 2024-2026 GoodData Corporation

import { type IRepeaterProps, Repeater } from "@gooddata/sdk-ui-charts";

import { RepeaterWithOneAttributeAndInlineVisualisation } from "./base.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const colorsAndPalette = scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({
        groupUnder: "coloring",
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", RepeaterWithOneAttributeAndInlineVisualisation, coloringCustomizer);

export const coloring = [colorsAndPalette];
