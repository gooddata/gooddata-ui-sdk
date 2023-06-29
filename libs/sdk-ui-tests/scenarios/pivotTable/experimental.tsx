// (C) 2007-2019 GoodData Corporation
import { ExperimentalMd } from "@gooddata/experimental-workspace";
import { scenariosFor } from "../../src/index.js";
import { newRankingFilter, newMeasureValueFilter } from "@gooddata/sdk-model";
import { PivotTable, IPivotTableProps } from "@gooddata/sdk-ui-pivot";

export const PivotTableWithRankingFilter = {
    measures: [ExperimentalMd.Amount],
    rows: [ExperimentalMd.Product.Default],
    filters: [newRankingFilter(ExperimentalMd.Amount, "BOTTOM", 10)],
};

export const PivotTableWithMeasureValueFilter = {
    measures: [ExperimentalMd.Amount],
    rows: [ExperimentalMd.Product.Default],
    filters: [newMeasureValueFilter(ExperimentalMd.Amount, "GREATER_THAN", 500)],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames("experiments")
    .withDefaultWorkspaceType("experimental-workspace")
    .withVisualTestConfig({ screenshotSize: { width: 1200, height: 800 } })
    .withDefaultTestTypes("api")
    .addScenario("with measure value filter", PivotTableWithRankingFilter)
    .addScenario("with ranking filter", PivotTableWithMeasureValueFilter);
