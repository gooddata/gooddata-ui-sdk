// (C) 2020 GoodData Corporation

import { convertMeasure } from "../MeasureConverter";
import { invalidMeasureDefinition } from "./InvalidInputs.fixture";
import { ReferenceLdm } from "@gooddata/reference-workspace";
import {
    newArithmeticMeasure,
    newPopMeasure,
    newPreviousPeriodMeasure,
    newMeasure,
    newPositiveAttributeFilter,
} from "@gooddata/sdk-model";
import { DEFAULT_DECIMAL_FORMAT, DEFAULT_INTEGER_FORMAT } from "../constants";

describe("measure converter", () => {
    const Scenarios: Array<[string, any]> = [
        ["local identifier of measure", ReferenceLdm.Amount],
        [
            "converted arithmetic measure definition from model to AFM",
            newArithmeticMeasure(["foo", "bar"], "sum"),
        ],
        ["converted pop measure definition from model to AFM", newPopMeasure(ReferenceLdm.Won, "attr")],
        [
            "converted previous period measure from model to AFM",
            newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }]),
        ],
        ["format of measure: change", newArithmeticMeasure(["foo", "bar"], "change")],
        ["format of measure: ratio", newMeasure("foo", (m) => m.ratio())],
        ["format of measure: count", newMeasure("foo", (m) => m.aggregation("count"))],
        [
            "converted definition",
            newMeasure("foo", (m) => m.filters(newPositiveAttributeFilter("filter", { uris: ["baz"] }))),
        ],
        ["converted alias", newMeasure("foo", (m) => m.alias("alias"))],
        ["custom format: simple measure", newMeasure("foo", (m) => m.format("custom #,##0,00"))],
        [
            "custom format: arithmetic measure",
            newArithmeticMeasure(["foo", "bar"], "change", (m) => m.format("custom #,##0,00")),
        ],
        [
            "custom format: pop measure",
            newPopMeasure(ReferenceLdm.Won, "attr", (m) => m.format("custom #,##0,00")),
        ],
        [
            "custom format: previous period measure",
            newPreviousPeriodMeasure("foo", [{ dataSet: "bar", periodsAgo: 3 }], (m) =>
                m.format("custom #,##0,00"),
            ),
        ],
        [
            "custom format: sum measure override",
            newMeasure("foo", (m) => m.format(DEFAULT_DECIMAL_FORMAT).ratio().aggregation("sum")),
        ],
        [
            "custom format: count measure override",
            newMeasure("foo", (m) => m.format(DEFAULT_INTEGER_FORMAT).ratio().aggregation("count")),
        ],
    ];
    it.each(Scenarios)("should return %s", (_disc, input) => {
        expect(convertMeasure(input)).toMatchSnapshot();
    });

    it("should throw an error when measure definition is not supported", () => {
        expect(() => convertMeasure(invalidMeasureDefinition)).toThrowErrorMatchingSnapshot();
    });
});
