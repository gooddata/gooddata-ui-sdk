// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { IXirrProps, Xirr } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { SampleXirrMeasurePredicate } from "../../_infra/predicates";

export default scenariosFor<IXirrProps>("XIRR", Xirr)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta")
    .addScenario("drilling on single measure", {
        measure: ReferenceLdm.SampleXIRR,
        attribute: ReferenceLdm.TimelineYear,
        drillableItems: [SampleXirrMeasurePredicate],
    })
    .addScenario("drilling on single measure with underlining disabled", {
        measure: ReferenceLdm.SampleXIRR,
        attribute: ReferenceLdm.TimelineYear,
        drillableItems: [SampleXirrMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    });
