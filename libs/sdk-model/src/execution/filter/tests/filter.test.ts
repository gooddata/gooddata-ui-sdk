// (C) 2019-2020 GoodData Corporation

import { Account, ClosedDate, Won } from "../../../../__mocks__/model.js";
import {
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newRelativeDateFilter,
    newRankingFilter,
} from "../factory.js";
import {
    filterIsEmpty,
    IAttributeElements,
    IFilter,
    filterAttributeElements,
    filterObjRef,
    measureValueFilterCondition,
    measureValueFilterMeasure,
    absoluteDateFilterValues,
    relativeDateFilterValues,
    filterMeasureRef,
} from "../index.js";
import { ObjRef, ObjRefInScope } from "../../../objRef/index.js";
import { localIdRef } from "../../../index.js";

const AbsoluteDateFilter = newAbsoluteDateFilter(ClosedDate.MmDdYyyy.attribute.displayForm, "2018", "2019");

const RelativeDateFilter = newRelativeDateFilter(
    ClosedDate.MmDdYyyy.attribute.displayForm,
    "GDC.time.date",
    -6,
    0,
);

const MeasureValueFilter = newMeasureValueFilter(Won, "EQUAL_TO", 42);
const RankingFilter = newRankingFilter(Won, "TOP", 5);

const InvalidScenarios: Array<[string, any]> = [
    ["filter undefined", undefined],
    ["filter null", undefined],
];

describe("filterIsEmpty", () => {
    const Scenarios: Array<[boolean, string, any]> = [
        [true, "no items in positive filter", newPositiveAttributeFilter(Account.Name, [])],
        [true, "no items in negative filter", newNegativeAttributeFilter(Account.Name, [])],
        [false, "values in positive filter", newPositiveAttributeFilter(Account.Name, ["value1"])],
        [false, "values in negative filter", newNegativeAttributeFilter(Account.Name, ["value1"])],
        [false, "uris in positive filter", newPositiveAttributeFilter(Account.Name, { uris: ["/uri1"] })],
        [false, "uris in negative filter", newNegativeAttributeFilter(Account.Name, { uris: ["/uri1"] })],
    ];

    it.each(Scenarios)("should return %s when %s", (expectedResult, _desc, input) => {
        expect(filterIsEmpty(input)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => filterIsEmpty(input)).toThrow();
    });
});

describe("filterAttributeElements", () => {
    const Scenarios: Array<[string, IFilter | null | undefined, IAttributeElements | undefined]> = [
        ["undefined for date filter", AbsoluteDateFilter, undefined],
        [
            "empty values for positive attribute filter with empty values",
            newPositiveAttributeFilter(Account.Name, []),
            { values: [] },
        ],
        [
            "empty values for negative attribute filter with empty values",
            newNegativeAttributeFilter(Account.Name, []),
            { values: [] },
        ],
        [
            "proper values for positive attribute filter with non-empty values",
            newPositiveAttributeFilter(Account.Name, ["foo"]),
            { values: ["foo"] },
        ],
        [
            "proper values for negative attribute filter with non-empty values",
            newNegativeAttributeFilter(Account.Name, ["foo"]),
            { values: ["foo"] },
        ],
    ];

    it.each(Scenarios)("should return %s", (_, input, expectedResult) => {
        expect(filterAttributeElements(input as any)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => filterAttributeElements(input)).toThrow();
    });
});

describe("filterAttributeDisplayForm", () => {
    const Scenarios: Array<[string, IFilter | null | undefined, ObjRef | undefined]> = [
        ["undefined for measure filter", MeasureValueFilter, undefined],
        [
            "attribute display form identifier for positive attribute filter",
            newPositiveAttributeFilter(Account.Name, []),
            Account.Name.attribute.displayForm,
        ],
        [
            "attribute display form identifier for negative attribute filter",
            newNegativeAttributeFilter(Account.Name, []),
            Account.Name.attribute.displayForm,
        ],
        [
            "attribute display form identifier for absolute date filter",
            AbsoluteDateFilter,
            ClosedDate.MmDdYyyy.attribute.displayForm,
        ],
        [
            "attribute display form identifier for relative date filter",
            RelativeDateFilter,
            ClosedDate.MmDdYyyy.attribute.displayForm,
        ],
    ];

    it.each(Scenarios)("should return %s", (_, input, expectedResult) => {
        expect(filterObjRef(input as any)).toEqual(expectedResult);
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => filterObjRef(input)).toThrow();
    });
});

describe("filterMeasureRef", () => {
    const Scenarios: Array<[string, IFilter, ObjRefInScope | undefined]> = [
        ["undefined for absolute date filter", AbsoluteDateFilter, undefined],
        ["undefined for negative attribute filter", newNegativeAttributeFilter(Account.Name, []), undefined],
        ["measure for ranking filter", RankingFilter, localIdRef(Won.measure.localIdentifier)],
        ["measure for measure value filter", MeasureValueFilter, localIdRef(Won.measure.localIdentifier)],
    ];

    it.each(Scenarios)("should return %s", (_, input, expectedResult) => {
        expect(filterMeasureRef(input)).toEqual(expectedResult);
    });
});

describe("absoluteDateFilterValues", () => {
    it("should return proper value for absolute date filter", () => {
        expect(absoluteDateFilterValues(AbsoluteDateFilter)).toEqual({
            from: "2018",
            to: "2019",
        });
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => absoluteDateFilterValues(input)).toThrow();
    });
});

describe("relativeDateFilterValues", () => {
    it("should return proper value for relative date filter", () => {
        expect(relativeDateFilterValues(RelativeDateFilter)).toEqual({
            from: -6,
            to: 0,
            granularity: "GDC.time.date",
        });
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => relativeDateFilterValues(input)).toThrow();
    });
});

describe("measureValueFilterMeasure", () => {
    it("should return proper value for measure value filter", () => {
        expect(measureValueFilterMeasure(MeasureValueFilter)).toEqual({
            localIdentifier: Won.measure.localIdentifier,
        });
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => measureValueFilterMeasure(input)).toThrow();
    });
});

describe("measureValueFilterCondition", () => {
    it("should return proper value for measure value filter", () => {
        expect(measureValueFilterCondition(MeasureValueFilter)).toEqual({
            comparison: {
                operator: "EQUAL_TO",
                value: 42,
            },
        });
    });

    it.each(InvalidScenarios)("should throw when %s", (_desc, input) => {
        expect(() => measureValueFilterCondition(input)).toThrow();
    });
});
