// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { ColumnChart, IBarChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IBarChartProps>("ColumnChart", ColumnChart)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Won],
    })
    .addScenario("single measure with viewBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name],
    })
    .addScenario("single measure with viewBy and stackBy", {
        measures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name],
        stackBy: ReferenceLdm.Region,
    });
