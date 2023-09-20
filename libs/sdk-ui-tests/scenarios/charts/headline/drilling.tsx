// (C) 2007-2019 GoodData Corporation
import { ReferenceMd } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import {
    AmountMeasurePredicate,
    ProbabilityMeasurePredicate,
    WonMeasurePredicate,
} from "../../_infra/predicates.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";
import { comparisonDisabled, comparisonEnabled, HeadlinePositiveComparisonMeasures } from "./comparison.js";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.Drilling)
    .withDefaultTags("vis-config-only", "mock-no-scenario-meta", "mock-no-insight")
    .withDefaultBackendSettings({
        enableNewHeadline: false,
    })
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
    })
    .withDefaultBackendSettings({
        enableNewHeadline: true,
    })
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
