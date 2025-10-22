// (C) 2007-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { IXirrProps, Xirr } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
    })
    .addScenario("only measure", {
        measure: ReferenceMd.SampleXIRR,
    })
    .addScenario("correct config", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.TimelineYear.Default,
    })
    .addScenario("semantically wrong measure", {
        measure: ReferenceMd.TimelineEOP,
        attribute: ReferenceMd.DateDatasets.Timeline.TimelineYear.Default,
    });
