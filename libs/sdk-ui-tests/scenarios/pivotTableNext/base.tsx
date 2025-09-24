// (C) 2007-2025 GoodData Corporation

import { requestPages } from "@gooddata/mock-handling";
import { ReferenceMd, ReferenceMdExt } from "@gooddata/reference-workspace";
import { IAttribute, modifyAttribute, newAbsoluteDateFilter } from "@gooddata/sdk-model";
import {
    IPivotTableNextProps,
    PivotTableNext,
    PivotTableNextConfig,
    newWidthForAllColumnsForMeasure,
    newWidthForAttributeColumn,
} from "@gooddata/sdk-ui-pivot/next";

import { scenariosFor } from "../../src/index.js";
import { ScenarioGroupNames } from "../charts/_infra/groupNames.js";

export function getCommonPivotTableSizingConfig(attributesUsed: IAttribute[] = []): PivotTableNextConfig {
    return {
        columnSizing: {
            columnWidths: [
                newWidthForAllColumnsForMeasure(ReferenceMd.Amount, 100),
                newWidthForAllColumnsForMeasure(ReferenceMd.Probability, 100),
                newWidthForAllColumnsForMeasure(ReferenceMd.Won, 100),
                ...attributesUsed.map((attribute) => newWidthForAttributeColumn(attribute, 120)),
            ],
            defaultWidth: "unset",
            growToFit: false,
        },
    };
}

export const PivotTableWithSingleColumn = {
    columns: [ReferenceMd.Product.Name],
};

export const PivotTableWithTwoMeasuresAndSingleRowAttr = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    rows: [ReferenceMd.Product.Name],
};

export const PivotTableWighSingleMeasureAndSingleRowColAttr = {
    measures: [ReferenceMd.Amount],
    rows: [ReferenceMd.SalesRep.Default],
    columns: [ReferenceMd.ForecastCategory],
};

export const PivotTableWighTwoMeasureAndSingleRowColAttr = {
    measures: [ReferenceMd.Amount, ReferenceMd.Probability],
    rows: [ReferenceMd.SalesRep.Default],
    columns: [ReferenceMd.ForecastCategory],
};

export const PivotTableWithSingleMeasureAndTwoRowsAndCols = {
    measures: [ReferenceMd.Amount],
    rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
    columns: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
};

export const PivotTableWithTwoMeasuresAndTwoRowsAndCols = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
    columns: [ReferenceMd.ForecastCategory, ReferenceMd.Region.Default],
};

export const PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default, ReferenceMd.SalesRep.Default],
    columns: [ReferenceMd.ForecastCategory, ReferenceMd.Region.Default],
};

export const PivotTableWithArithmeticMeasures = {
    measures: [
        ReferenceMd.Amount,
        ReferenceMd.Won,
        ReferenceMdExt.CalculatedLost,
        ReferenceMdExt.CalculatedWonLostRatio,
    ],
    rows: [ReferenceMd.Product.Name],
};

export const PivotTableWithMeasuresAndRowsOnly = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    rows: [ReferenceMd.Department.Default, ReferenceMd.Region.Default],
};

export const PivotTableWithMeasuresAndColumnOnly = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    columns: [ReferenceMd.Region.Default],
};

export const PivotTableWithMeasuresAndColumnsOnly = {
    measures: [ReferenceMd.Amount, ReferenceMd.Won],
    columns: [ReferenceMd.Department.Default, ReferenceMd.Region.Default],
};

export const PivotTableWithAttributesWithoutMeasures = {
    measures: [],
    rows: [ReferenceMd.StageName.Default, ReferenceMd.Region.Default],
    columns: [ReferenceMd.Department.Default],
};

const modifiedCreatedYear: IAttribute = modifyAttribute(
    ReferenceMd.DateDatasets.Created.CreatedYear.Default,
    (m) => m.localId("created.test"),
);

export const PivotTableWithTwoSameDate = {
    measures: [ReferenceMd.Amount],
    rows: [ReferenceMd.DateDatasets.Created.CreatedYear.Default, modifiedCreatedYear],
    columns: [],
};

const modifiedProductName: IAttribute = modifyAttribute(ReferenceMd.Product.Name, (m) =>
    m.localId("product.name.test"),
);

export const PivotTableWithRepeatingRowAttributes = {
    measures: [ReferenceMd.Amount],
    rows: [ReferenceMd.Product.Name, ReferenceMd.Region.Default, modifiedProductName],
    columns: [],
};

export default scenariosFor<IPivotTableNextProps>("PivotTableNext", PivotTableNext)
    .withGroupNames(ScenarioGroupNames.BucketConfigVariants)
    .withVisualTestConfig({ screenshotSize: { width: 1000, height: 800 } })
    .addScenario("single attribute", {
        rows: [ReferenceMd.Product.Name],
        columns: [],
        measures: [],
    })
    .addScenario("single column", PivotTableWithSingleColumn)
    .addScenario("single measure", {
        measures: [ReferenceMd.Amount],
    })
    .addScenario("single measure with row attribute", {
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name],
    })
    .addScenario("single measure with column attribute", {
        measures: [ReferenceMd.Amount],
        columns: [ReferenceMd.Region.Default],
    })
    .addScenario("single measure with row and column attributes", {
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name],
        columns: [ReferenceMd.Region.Default],
    })
    .addScenario("single measure with two row and one column attributes", {
        measures: [ReferenceMd.Amount],
        rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
        columns: [ReferenceMd.Region.Default],
    })
    .addScenario(
        "single measure with two row and two column attributes",
        PivotTableWithSingleMeasureAndTwoRowsAndCols,
    )
    .addScenario("two measures", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
    })
    .addScenario("two measures with row attribute", PivotTableWithTwoMeasuresAndSingleRowAttr)
    .addScenario("two measures with column attribute", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        columns: [ReferenceMd.Region.Default],
    })
    .addScenario("two measures with row and column attributes", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        rows: [ReferenceMd.Product.Name],
        columns: [ReferenceMd.Region.Default],
    })
    .addScenario("two measures with two row and one column attributes", {
        measures: [ReferenceMd.Amount, ReferenceMd.Won],
        rows: [ReferenceMd.Product.Name, ReferenceMd.Department.Default],
        columns: [ReferenceMd.Region.Default],
    })
    .addScenario(
        "two measures with two row and two column attributes",
        PivotTableWithTwoMeasuresAndTwoRowsAndCols,
        (m) => m.withCustomDataCapture({ windows: requestPages([0, 0], [22, 1000], 1) }),
    )
    .addScenario(
        "two measures with three rows and two column attributes",
        PivotTableWithTwoMeasuresAndThreeRowsAndTwoCols,
    )
    .addScenario("empty values", PivotTableWithSingleMeasureAndTwoRowsAndCols)
    .addScenario("arithmetic measures", PivotTableWithArithmeticMeasures)
    .addScenario("with attributes without measures", PivotTableWithAttributesWithoutMeasures)
    .addScenario("with two same dates", PivotTableWithTwoSameDate)
    .addScenario(
        "one measure and repeating row attributes on different positions",
        PivotTableWithRepeatingRowAttributes,
    )
    .addScenario(
        "with date filter",
        {
            ...PivotTableWithTwoMeasuresAndTwoRowsAndCols,
            filters: [
                newAbsoluteDateFilter(ReferenceMd.DateDatasets.Activity.ref, "2021-01-01", "2021-02-01"),
            ],
        },
        (m) => m.withTests("api"),
    );
