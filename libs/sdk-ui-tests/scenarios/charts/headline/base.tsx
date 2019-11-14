// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
    .addScenario("single measure", {
        primaryMeasure: ReferenceLdm.Won,
    })
    .addScenario("two measures", {
        primaryMeasure: ReferenceLdm.Won,
        secondaryMeasure: ReferenceLdm.Amount,
    });
