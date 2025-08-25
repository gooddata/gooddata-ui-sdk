// (C) 2024-2025 GoodData Corporation

import { IRepeaterProps, Repeater } from "@gooddata/sdk-ui-charts";

import { RepeaterWithOneAttributeAndInlineVisualisation } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { canvasCustomizer } from "../_infra/canvasVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

const canvasScenarios = scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "canvas" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("canvas", RepeaterWithOneAttributeAndInlineVisualisation, canvasCustomizer);

export default [canvasScenarios];
