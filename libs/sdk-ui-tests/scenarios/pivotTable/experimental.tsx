// (C) 2007-2019 GoodData Corporation
import { ExperimentalLdm } from "@gooddata/experimental-workspace";
import { scenariosFor } from "../../src";
import { newRankingFilter, newMeasureValueFilter } from "@gooddata/sdk-model";
import { PivotTable, IPivotTableProps } from "@gooddata/sdk-ui-pivot";

const PivotTableWithRankingFilter = {
    measures: [ExperimentalLdm.Amount],
    viewBy: [ExperimentalLdm.Product.Default],
    filters: [newRankingFilter(ExperimentalLdm.Amount, [], "BOTTOM", 10)],
};

const PivotTableWithMeasureValueFilter = {
    measures: [ExperimentalLdm.Amount],
    viewBy: [ExperimentalLdm.Product.Default],
    filters: [newMeasureValueFilter(ExperimentalLdm.Amount, "GREATER_THAN", 500)],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("experiments")
    .withDefaultWorkspaceType("experimental-workspace")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTestTypes("api")
    .addScenario("with measure value filter", PivotTableWithRankingFilter)
    .addScenario("with ranking filter", PivotTableWithMeasureValueFilter);
