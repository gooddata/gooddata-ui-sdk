// (C) 2019 GoodData Corporation

import { Account, ClosedDate, Won } from "../../../__mocks__/model";
import {
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    newAbsoluteDateFilter,
    newMeasureValueFilter,
    newRelativeDateFilter,
} from "../factory";
import {
    filterIsEmpty,
    AttributeElements,
    IFilter,
    filterAttributeElements,
    filterAttributeDisplayForm,
    measureValueFilterCondition,
    measureValueFilterMeasure,
    absoluteDateFilterValues,
    relativeDateFilterValues,
} from "../index";
import { objectRefValue, ObjRef } from "../../base";

const AbsoluteDateFilter = newAbsoluteDateFilter(
    objectRefValue(ClosedDate.MmDdYyyy.attribute.displayForm),
    "2018",
    "2019",
);

const RelativeDateFilter = newRelativeDateFilter(
    objectRefValue(ClosedDate.MmDdYyyy.attribute.displayForm),
    "GDC.time.date",
    -6,
    0,
);

const MeasureValueFilter = newMeasureValueFilter(Won, "EQUAL_TO", 42);

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
});

describe("filterAttributeElements", () => {
    const Scenarios: Array<[string, IFilter | null | undefined, AttributeElements | undefined]> = [
        ["undefined for null filter", null, undefined],
        ["undefined for undefined filter", undefined, undefined],
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
});

describe("filterAttributeDisplayForm", () => {
    const Scenarios: Array<[string, IFilter | null | undefined, ObjRef | undefined]> = [
        ["undefined for null filter", null, undefined],
        ["undefined for undefined filter", undefined, undefined],
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
        expect(filterAttributeDisplayForm(input as any)).toEqual(expectedResult);
    });
});

describe("absoluteDateFilterValues", () => {
    it("should return proper value for absolute date filter", () => {
        expect(absoluteDateFilterValues(AbsoluteDateFilter)).toEqual({
            from: "2018",
            to: "2019",
        });
    });

    it("should throw for undefined relative date filter", () => {
        // @ts-ignore
        expect(() => absoluteDateFilterValues(undefined)).toThrow();
    });

    it("should throw for null relative date filter", () => {
        // @ts-ignore
        expect(() => absoluteDateFilterValues(null)).toThrow();
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

    it("should throw for undefined relative date filter", () => {
        // @ts-ignore
        expect(() => relativeDateFilterValues(undefined)).toThrow();
    });

    it("should throw for null relative date filter", () => {
        // @ts-ignore
        expect(() => relativeDateFilterValues(null)).toThrow();
    });
});

describe("measureValueFilterMeasure", () => {
    it("should return proper value for measure value filter", () => {
        expect(measureValueFilterMeasure(MeasureValueFilter)).toEqual({
            localIdentifier: Won.measure.localIdentifier,
        });
    });

    it("should throw for undefined measure value filter", () => {
        // @ts-ignore
        expect(() => measureValueFilterMeasure(undefined)).toThrow();
    });

    it("should throw for null measure value filter", () => {
        // @ts-ignore
        expect(() => measureValueFilterMeasure(null)).toThrow();
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

    it("should throw for undefined measure value filter", () => {
        // @ts-ignore
        expect(() => measureValueFilterCondition(undefined)).toThrow();
    });

    it("should throw for null measure value filter", () => {
        // @ts-ignore
        expect(() => measureValueFilterCondition(null)).toThrow();
    });
});
