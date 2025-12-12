// (C) 2021-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type IXirrProps, Xirr } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.TimelineYear.Default,
    })
    .addScenario(
        "font",
        {
            measure: ReferenceMd.SampleXIRR,
            attribute: ReferenceMd.DateDatasets.Timeline.TimelineYear.Default,
        },
        (m) => m.withTags("themed", "font"),
    );
