// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { ColumnChart, IColumnChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IColumnChartProps>("ColumnChart", ColumnChart)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
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
