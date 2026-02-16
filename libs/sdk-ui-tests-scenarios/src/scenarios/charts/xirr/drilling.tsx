// (C) 2007-2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { type IXirrProps, Xirr } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { SampleXirrMeasurePredicate } from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const drilling = scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("drilling on single measure", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.TimelineYear.Default,
        drillableItems: [SampleXirrMeasurePredicate],
    })
    .addScenario("drilling on single measure with underlining disabled", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.TimelineYear.Default,
        drillableItems: [SampleXirrMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    });
