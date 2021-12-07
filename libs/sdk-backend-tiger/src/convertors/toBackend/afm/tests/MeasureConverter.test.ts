// (C) 2020 GoodData Corporation

import { convertMeasure } from "../MeasureConverter";
import { ReferenceMd } from "@gooddata/reference-workspace";
import {
    DateGranularity,
    newAbsoluteDateFilter,
    newArithmeticMeasure,
    newMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    newRelativeDateFilter,
} from "@gooddata/sdk-model";
import { invalidMeasureDefinition, invalidObjQualifier } from "./InvalidInputs.fixture";

describe("measure converter", () => {
    const Scenarios: Array<[string, any]> = [
        [
            "converted arithmetic measure definition from model to AFM",
            newArithmeticMeasure(["foo", "bar"], "sum"),
        ],
        ["converted pop measure definition from model to AFM", newPopMeasure(ReferenceMd.Won, "attr")],
        [
            "converted previous period measure from model to AFM",
            newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }]),
        ],
        ["converted simple measure from model to AFM", newMeasure("foo")],
        ["format of measure: change", newArithmeticMeasure(["foo", "bar"], "change")],
        ["format of measure: ratio", newMeasure("foo", (m) => m.ratio())],
        ["format of measure: count", newMeasure("foo", (m) => m.aggregation("count"))],
        ["format of measure: sum", newMeasure("foo", (m) => m.aggregation("sum"))],
        ["format of measure: avg", newMeasure("foo", (m) => m.aggregation("avg"))],
        ["format of measure: max", newMeasure("foo", (m) => m.aggregation("max"))],
        ["format of measure: median", newMeasure("foo", (m) => m.aggregation("median"))],
        ["format of measure: min", newMeasure("foo", (m) => m.aggregation("min"))],
        ["format of measure: runsum", newMeasure("foo", (m) => m.aggregation("runsum"))],
        [
            "measure with two filters",
            newMeasure("foo", (m) =>
                m.filters(
                    newAbsoluteDateFilter(ReferenceMd.DateDatasets.Closed.ref, "2019-08-06", "2019-08-12"),
                    newRelativeDateFilter(ReferenceMd.DateDatasets.Closed.ref, DateGranularity.date, 5, 22),
                ),
            ),
        ],
        ["converted alias", newMeasure("foo", (m) => m.alias("alias"))],
    ];

    it.each(Scenarios)("should return %s", (_desc, input) => {
        expect(convertMeasure(input)).toMatchSnapshot();
    });

    it("should throw an error when measure definition is not supported", () => {
        expect(() => convertMeasure(invalidMeasureDefinition)).toThrowErrorMatchingSnapshot();
    });
    it("should throw an error when toObjQualifier gets an URI ref", () => {
        expect(() => {
            convertMeasure(invalidObjQualifier);
        }).toThrowErrorMatchingSnapshot();
    });
});
