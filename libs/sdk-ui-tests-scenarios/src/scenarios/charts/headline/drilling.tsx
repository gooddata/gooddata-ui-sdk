// (C) 2007-2026 GoodData Corporation

import { ReferenceMd } from "@gooddata/reference-workspace";
import { Headline, type IHeadlineProps } from "@gooddata/sdk-ui-charts";

import { HeadlinePositiveComparisonMeasures, comparisonDisabled, comparisonEnabled } from "./comparison.js";
import { scenariosFor } from "../../../scenarioGroup.js";
import {
    AmountMeasurePredicate,
    ProbabilityMeasurePredicate,
    WonMeasurePredicate,
} from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const drilling = scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .addScenario("multi measures with drilling on single measure", {
        primaryMeasure: ReferenceMd.Won,
        drillableItems: [WonMeasurePredicate],
    })
    .addScenario("multi measures with drilling on single measure with underlining disabled", {
        primaryMeasure: ReferenceMd.Won,
        drillableItems: [WonMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    })
    .addScenario("multi measures with drilling on two measures", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasures: [ReferenceMd.Amount],
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
        config: {
            comparison: comparisonDisabled,
        },
    })
    .addScenario("multi measures with drilling on two measures with underlining disabled", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasures: [ReferenceMd.Amount],
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
        config: {
            disableDrillUnderline: true,
            comparison: comparisonDisabled,
        },
    })
    .addScenario("multi measures with drilling on three measures", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasures: [ReferenceMd.Probability, ReferenceMd.Amount],
        drillableItems: [WonMeasurePredicate, ProbabilityMeasurePredicate, AmountMeasurePredicate],
    })
    .addScenario("multi measures with drilling on three measures with underlining disabled", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasures: [ReferenceMd.Probability, ReferenceMd.Amount],
        drillableItems: [WonMeasurePredicate, ProbabilityMeasurePredicate, AmountMeasurePredicate],
        config: {
            disableDrillUnderline: true,
        },
    })
    .withDefaultTestTypes("visual")
    .addScenario("comparison with drilling on two measures", {
        ...HeadlinePositiveComparisonMeasures,
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
        config: {
            comparison: comparisonEnabled,
        },
    })
    .addScenario("comparison with drilling on two measures with underlining disabled", {
        ...HeadlinePositiveComparisonMeasures,
        drillableItems: [WonMeasurePredicate, AmountMeasurePredicate],
        config: {
            disableDrillUnderline: true,
            comparison: comparisonEnabled,
        },
    });
