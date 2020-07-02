// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui-charts";
import { scenariosFor } from "../../../src";
import { GermanNumberFormat } from "../../_infra/formatting";
import { ScenarioGroupNames } from "../_infra/groupNames";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .addScenario("single measure", {
        primaryMeasure: ReferenceLdm.Won,
    })
    .addScenario("two measures", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdm.Amount,
    })
    .addScenario("two measures with german separators", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdm.Amount,
        config: {
            separators: GermanNumberFormat,
        },
    })
    .addScenario("two measures one PoP", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdmExt.WonPopClosedYear,
    });
