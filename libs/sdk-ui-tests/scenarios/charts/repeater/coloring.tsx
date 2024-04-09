// (C) 2024 GoodData Corporation

import { IRepeaterProps, Repeater } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { coloringCustomizer } from "../_infra/coloringVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { RepeaterWithOneAttributeAndInlineVisualisation } from "./base.js";

const colorsAndPalette = scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(...ScenarioGroupNames.Coloring)
    .withVisualTestConfig({ groupUnder: "coloring" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("coloring", RepeaterWithOneAttributeAndInlineVisualisation, coloringCustomizer);

export default [colorsAndPalette];
