// (C) 2021-2025 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../src/index.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        // TODO: the amount on KD full size is flaky and cannot be reproduced
        misMatchThreshold: 0.25,
    })
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
