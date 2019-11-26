// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../src";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui";

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with row attributes", {
        measures: [ReferenceLdm.Amount],
        rows: [ReferenceLdm.Product.Name],
    })
    .addScenario("single measure with row and column attributes", {
        measures: [ReferenceLdm.Amount],
        rows: [ReferenceLdm.Product.Name],
        columns: [ReferenceLdm.Region],
    });
