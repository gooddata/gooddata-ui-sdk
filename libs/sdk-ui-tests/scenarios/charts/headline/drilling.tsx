// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { AmountMeasurePredicate, WonMeasurePredicate } from "../../_infra/predicates";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("drilling on single measure", {
        primaryMeasure: ReferenceLdm.Won,
        drillableItems: [WonMeasurePredicate],
    })
    .addScenario("drilling on single measure with underlining disabled", {
        primaryMeasure: ReferenceLdm.Won,
        drillableItems: [WonMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    })
    .addScenario("drilling on two measures", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdm.Amount,
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
    })
    .addScenario("drilling on two measures with underlining disabled", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdm.Amount,
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    });
