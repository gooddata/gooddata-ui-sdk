// (C) 2021-2025 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IXirrProps, Xirr } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(...ScenarioGroupNames.Theming)
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
