// (C) 2007-2025 GoodData Corporation

import { ITreemapProps, Treemap } from "@gooddata/sdk-ui-charts";

import { TreemapWithMeasureViewByAndSegmentBy } from "./base.js";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<ITreemapProps>("Treemap", Treemap)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", TreemapWithMeasureViewByAndSegmentBy)
    .addScenario("font", TreemapWithMeasureViewByAndSegmentBy, (m) => m.withTags("themed", "font"));
