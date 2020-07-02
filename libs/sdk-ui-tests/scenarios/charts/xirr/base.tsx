// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Xirr, IXirrProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("only measure", {
        measure: ReferenceLdm.SampleXIRR,
    })
    .addScenario("correct config", {
        measure: ReferenceLdm.SampleXIRR,
        attribute: ReferenceLdm.TimelineYear,
    })
    .addScenario("semantically wrong measure", {
        measure: ReferenceLdm.TimelineEOP,
        attribute: ReferenceLdm.TimelineYear,
    });
