// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Treemap, ITreemapProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<ITreemapProps>("Treemap", Treemap)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure and viewBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: ReferenceLdm.Product.Name,
    })
    .addScenario("single measure, viewBy and segment", {
        measures: [ReferenceLdm.Amount],
        viewBy: ReferenceLdm.Product.Name,
        segmentBy: ReferenceLdm.Region,
    });
