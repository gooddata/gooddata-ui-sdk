// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { BarChart, IBarChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IBarChartProps>("BarChart", BarChart)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Won],
    })
    .addScenario("single measure with viewBy", {
        measures: [ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Account.Name],
    })
    .addScenario("single measure with viewBy and stackBy", {
        measures: [ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Account.Name],
        stackBy: ReferenceLdm.Department,
    });
