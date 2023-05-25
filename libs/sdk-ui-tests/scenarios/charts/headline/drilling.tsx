// (C) 2007-2019 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { AmountMeasurePredicate, WonMeasurePredicate } from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("drilling on single measure", {
        primaryMeasure: ReferenceMd.Won,
        drillableItems: [WonMeasurePredicate],
    })
    .addScenario("drilling on single measure with underlining disabled", {
        primaryMeasure: ReferenceMd.Won,
        drillableItems: [WonMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    })
    .addScenario("drilling on two measures", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasure: ReferenceMd.Amount,
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
    })
    .addScenario("drilling on two measures with underlining disabled", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasure: ReferenceMd.Amount,
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    });
