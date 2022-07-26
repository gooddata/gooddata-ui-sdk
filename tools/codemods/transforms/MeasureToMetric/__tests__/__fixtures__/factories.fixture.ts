// (C) 2022 GoodData Corporation
import {
    newMeasure,
    newPreviousPeriodMeasure,
    newPopMeasure,
    newArithmeticMeasure,
    newMeasureValueFilter,
} from "@gooddata/sdk-model";

export const measure = newMeasure("Measure", (m) => m.format("#,##0"));
export const ppMeasure = newPreviousPeriodMeasure("Measure", [{ dataSet: "Dataset", periodsAgo: 1 }], (m) =>
    m.alias("Alias").masterMeasure("SomeOther"),
);
export const popMeasure = newPopMeasure("Measure", "Attr", (m) =>
    m.alias("PoP measure").masterMeasure("SomeOther"),
);
export const changeMeasure = newArithmeticMeasure(["Measure", "AnotherMeasure"], "change", (m) =>
    m.title("Change"),
);
export const greaterThanFilter = newMeasureValueFilter("Measure", "GREATER_THAN", 7000000);
