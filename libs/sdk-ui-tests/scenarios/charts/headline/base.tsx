// (C) 2007-2025 GoodData Corporation

import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";

import { HeadlinePositiveComparisonMeasures, comparisonDisabled, comparisonEnabled } from "./comparison.js";
import { scenariosFor } from "../../../src/index.js";
import { GermanNumberFormat } from "../../_infra/formatting.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const HeadlineWithTwoMeasures = {
    primaryMeasure: ReferenceMd.Won,
    secondaryMeasure: ReferenceMd.Amount,
};

export const HeadlineWithOnlyPrimaryMeasure = {
    primaryMeasure: ReferenceMd.Won,
};

export const HeadlineWithThreeMeasures = {
    primaryMeasure: ReferenceMd.Won,
    secondaryMeasures: [ReferenceMd.Probability, ReferenceMd.Amount],
};

export const base = scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({
        viewports: [{ label: "desktop", width: 1464, height: 768 }],
        // TODO: the amount on KD full size is flaky and cannot be reproduced
        misMatchThreshold: 0.25,
    })
    .addScenario("multi measures with only primary measure", {
        ...HeadlineWithOnlyPrimaryMeasure,
    })
    .addScenario("multi measures with two measures", {
        ...HeadlineWithTwoMeasures,
        config: {
            comparison: comparisonDisabled,
        },
    })
    .addScenario("multi measures with three measures", {
        ...HeadlineWithThreeMeasures,
    })
    .addScenario("multi measures with two measures one PoP", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasures: [ReferenceMdExt.WonPopClosedYear],
        config: {
            comparison: comparisonDisabled,
        },
    })
    .addScenario("multi measures with two measures with german separators", {
        ...HeadlineWithTwoMeasures,
        config: {
            separators: GermanNumberFormat,
            comparison: comparisonDisabled,
        },
    })
    .withDefaultTestTypes("visual")
    .addScenario("two measures with comparison", {
        ...HeadlinePositiveComparisonMeasures,
        config: {
            comparison: comparisonEnabled,
        },
    });
