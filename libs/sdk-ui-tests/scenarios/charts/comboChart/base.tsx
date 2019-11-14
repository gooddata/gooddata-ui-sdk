// (C) 2007-2019 GoodData Corporation
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { ComboChart, IComboChartProps } from "@gooddata/sdk-ui";
import { scenariosFor } from "../../../src";

export default scenariosFor<IComboChartProps>("ComboChart", ComboChart)
    .addScenario("one primary measure", {
        primaryMeasures: [ReferenceLdm.Amount],
    })
    .addScenario("one primary measure with viewBy", {
        primaryMeasures: [ReferenceLdm.Amount],
        viewBy: [ReferenceLdm.Product.Name],
    })
    .addScenario("one primary and scenario measure with viewBy", {
        primaryMeasures: [ReferenceLdm.Amount],
        secondaryMeasures: [ReferenceLdm.Won],
        viewBy: [ReferenceLdm.Product.Name],
    });
