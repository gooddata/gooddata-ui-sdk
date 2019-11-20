// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { Headline, IHeadlineProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";
import { GermanNumberFormat } from "../_infra/dataLabelVariants";

export default scenariosFor<IHeadlineProps>("Headline", Headline)
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
