// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { Heatmap, IHeatmapProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IHeatmapProps>("Heatmap", Heatmap)
    .withVisualTestConfig({ screenshotSize: { width: 800, height: 800 } })
    .addScenario("measure only", {
        measure: ReferenceLdm.Amount,
    })
    .addScenario("measure and rows", {
        measure: ReferenceLdm.Amount,
        rows: ReferenceLdm.Product.Name,
    })
    .addScenario("measure, rows and columns", {
        measure: ReferenceLdm.Amount,
        rows: ReferenceLdm.Product.Name,
        columns: ReferenceLdm.Region,
    });
