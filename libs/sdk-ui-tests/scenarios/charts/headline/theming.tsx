// (C) 2021 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(...ScenarioGroupNames.Theming)
    .withDefaultTestTypes("visual")
    .withDefaultTags("themed")
    .addScenario("themed", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdm.Amount,
    });
