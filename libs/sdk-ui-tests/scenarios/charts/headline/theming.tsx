// (C) 2021 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasure: ReferenceMd.Amount,
    })
    .addScenario(
        "font",
        {
            primaryMeasure: ReferenceMd.Won,
            secondaryMeasure: ReferenceMd.Amount,
        },
        (m) => m.withTags("themed", "font"),
    );
