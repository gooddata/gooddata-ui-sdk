// (C) 2021-2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { Headline, type IHeadlineProps } from "@gooddata/sdk-ui-charts";

import { scenariosFor } from "../../../scenarioGroup.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const theming = scenariosFor<IHeadlineProps>("Headline", Headline)
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
