// (C) 2007-2019 GoodData Corporation
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src/index.js";
import { GermanNumberFormat } from "../../_infra/formatting.js";
import { ScenarioGroupNames } from "../_infra/groupNames.js";

export const HeadlineWithTwoMeasures = {
    primaryMeasure: ReferenceMd.Won,
    secondaryMeasure: ReferenceMd.Amount,
};

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        primaryMeasure: ReferenceMd.Won,
    })
    .addScenario("two measures", HeadlineWithTwoMeasures)
    .addScenario("two measures with german separators", {
        ...HeadlineWithTwoMeasures,
        config: {
            separators: GermanNumberFormat,
        },
    })
    .addScenario("two measures one PoP", {
        primaryMeasure: ReferenceMd.Won,
        secondaryMeasure: ReferenceMdExt.WonPopClosedYear,
    });
