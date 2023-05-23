// (C) 2019-2020 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import { isIdentifierRef, isLocalIdRef, isUriRef, isObjRef } from "../index.js";

describe("objRef type guard", () => {
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

    describe("isObjRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "uri ref", { uri: "/" }],
            [true, "identifier ref", { identifier: "id" }],
            [false, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isObjRef(input)).toBe(expectedResult);
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
