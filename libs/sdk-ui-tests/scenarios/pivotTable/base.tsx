// (C) 2007-2019 GoodData Corporation

import { scenariosFor } from "../../src";
import { ReferenceLdm, ReferenceLdmExt } from "@gooddata/reference-workspace";
import { IPivotTableProps, PivotTable } from "@gooddata/sdk-ui-pivot";
import { ScenarioGroupNames } from "../charts/_infra/groupNames";

export const PivotTableWithSingleColumn = {
    columns: [ReferenceLdm.Product.Name],
};

export const PivotTableWithTwoMeasuresAndSingleRowAttr = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    rows: [ReferenceLdm.Product.Name],
};

export const PivotTableWithSingleMeasureAndTwoRowsAndCols = {
    measures: [ReferenceLdm.Amount],
    rows: [ReferenceLdm.Product.Name, ReferenceLdm.Department],
    columns: [ReferenceLdm.StageName.Default, ReferenceLdm.Region],
};

export const PivotTableWithTwoMeasuresAndTwoRowsAndCols = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    rows: [ReferenceLdm.Product.Name, ReferenceLdm.Department],
    columns: [ReferenceLdm.ForecastCategory, ReferenceLdm.Region],
};

export const PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols = {
    measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    rows: [ReferenceLdm.Product.Name, ReferenceLdm.Department, ReferenceLdm.SalesRep.OwnerName],
    columns: [ReferenceLdm.ForecastCategory, ReferenceLdm.Region],
};

export const PivotTableWithArithmeticMeasures = {
    measures: [
        ReferenceLdm.Amount,
        ReferenceLdm.Won,
        ReferenceLdmExt.CalculatedLost,
        ReferenceLdmExt.CalculatedWonLostRatio,
    ],
    rows: [ReferenceLdm.Product.Name],
};

export default scenariosFor<IPivotTableProps>("PivotTable", PivotTable)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single attribute", {
        rows: [ReferenceLdm.Product.Name],
    })
    .addScenario("single column", PivotTableWithSingleColumn)
    .addScenario("single measure", {
        measures: [ReferenceLdm.Amount],
    })
    .addScenario("single measure with row attribute", {
        measures: [ReferenceLdm.Amount],
        rows: [ReferenceLdm.Product.Name],
    })
    .addScenario("single measure with column attribute", {
        measures: [ReferenceLdm.Amount],
        columns: [ReferenceLdm.Region],
    })
    .addScenario("single measure with row and column attributes", {
        measures: [ReferenceLdm.Amount],
        rows: [ReferenceLdm.Product.Name],
        columns: [ReferenceLdm.Region],
    })
    .addScenario("single measure with two row and one column attributes", {
        measures: [ReferenceLdm.Amount],
        rows: [ReferenceLdm.Product.Name, ReferenceLdm.Department],
        columns: [ReferenceLdm.Region],
    })
    .addScenario(
        "single measure with two row and two column attributes",
        PivotTableWithSingleMeasureAndTwoRowsAndCols,
    )
    .addScenario("two measures", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
    })
    .addScenario("two measures with row attribute", PivotTableWithTwoMeasuresAndSingleRowAttr)
    .addScenario("two measures with column attribute", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        columns: [ReferenceLdm.Region],
    })
    .addScenario("two measures with row and column attributes", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        rows: [ReferenceLdm.Product.Name],
        columns: [ReferenceLdm.Region],
    })
    .addScenario("two measures with two row and one column attributes", {
        measures: [ReferenceLdm.Amount, ReferenceLdm.Won],
        rows: [ReferenceLdm.Product.Name, ReferenceLdm.Department],
        columns: [ReferenceLdm.Region],
    })
    .addScenario(
        "two measures with two row and two column attributes",
        PivotTableWithTwoMeasuresAndTwoRowsAndCols,
    )
    .addScenario(
        "two measures with three rows and two column attributes",
        PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols,
    )
    .addScenario("empty values", PivotTableWithSingleMeasureAndTwoRowsAndCols)
    .addScenario("arithmetic measures", PivotTableWithArithmeticMeasures);
