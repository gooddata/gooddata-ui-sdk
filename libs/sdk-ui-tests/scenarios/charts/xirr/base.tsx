// (C) 2007-2019 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { Xirr, IXirrProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("only measure", {
        measure: ReferenceMd.SampleXIRR,
    })
    .addScenario("correct config", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.Year.Default,
    })
    .addScenario("semantically wrong measure", {
        measure: ReferenceMd.TimelineEOP,
        attribute: ReferenceMd.DateDatasets.Timeline.Year.Default,
    });
