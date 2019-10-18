// (C) 2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import { isDimension, MeasureGroupIdentifier, newDimension } from "../dimension";
import { Won } from "../../../__mocks__/model";
import { isIdentifierRef, isLocalIdRef, isUriRef } from "../index";

describe("dimension type guard", () => {
    describe("isDimension", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "dimension", newDimension([MeasureGroupIdentifier])],
            [false, "measure", Won],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDimension(input)).toBe(expectedResult);
        });
    });

    describe("isUriRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "uri ref", { uri: "/" }],
            [false, "identifier ref", { identifier: "id" }],
            [false, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isUriRef(input)).toBe(expectedResult);
        });
    });

    describe("isIdentifierRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "uri ref", { uri: "/" }],
            [true, "identifier ref", { identifier: "id" }],
            [false, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isIdentifierRef(input)).toBe(expectedResult);
        });
    });

    describe("isLocalIdRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [false, "uri ref", { uri: "/" }],
            [false, "identifier ref", { identifier: "id" }],
            [true, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isLocalIdRef(input)).toBe(expectedResult);
        });
    });
});
