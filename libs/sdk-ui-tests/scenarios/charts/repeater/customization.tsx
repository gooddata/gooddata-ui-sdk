// (C) 2024 GoodData Corporation

import { Repeater, IRepeaterProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { canvasCustomizer } from "../_infra/canvasVariants.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { RepeaterWithOneAttributeAndInlineVisualisation } from "./base.js";

const canvasScenarios = scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(ScenarioGroupNames.ConfigurationCustomization)
    .withVisualTestConfig({ groupUnder: "canvas" })
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenarios("canvas", RepeaterWithOneAttributeAndInlineVisualisation, canvasCustomizer);

export default [canvasScenarios];
