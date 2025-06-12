// (C) 2024 GoodData Corporation

import { IRepeaterProps, Repeater } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { RepeaterWithOneAttributeAndInlineVisualisation } from "./base.js";

export default scenariosFor<IRepeaterProps>("Repeater", Repeater)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", RepeaterWithOneAttributeAndInlineVisualisation)
    .addScenario("font", RepeaterWithOneAttributeAndInlineVisualisation, (m) => m.withTags("themed", "font"));
