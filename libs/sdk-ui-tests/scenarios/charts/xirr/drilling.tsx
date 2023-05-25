// (C) 2007-2019 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { IXirrProps, Xirr } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { SampleXirrMeasurePredicate } from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("drilling on single measure", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.Year.Default,
        drillableItems: [SampleXirrMeasurePredicate],
    })
    .addScenario("drilling on single measure with underlining disabled", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.Year.Default,
        drillableItems: [SampleXirrMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    });
