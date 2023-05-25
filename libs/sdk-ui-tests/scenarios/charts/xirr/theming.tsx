// (C) 2021 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { Xirr, IXirrProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IXirrProps>("Xirr", Xirr)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", {
        measure: ReferenceMd.SampleXIRR,
        attribute: ReferenceMd.DateDatasets.Timeline.Year.Default,
    })
    .addScenario(
        "font",
        {
            measure: ReferenceMd.SampleXIRR,
            attribute: ReferenceMd.DateDatasets.Timeline.Year.Default,
        },
        (m) => m.withTags("themed", "font"),
    );
