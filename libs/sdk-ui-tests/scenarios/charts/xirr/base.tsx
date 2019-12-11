// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Xirr, IXirrProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
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
