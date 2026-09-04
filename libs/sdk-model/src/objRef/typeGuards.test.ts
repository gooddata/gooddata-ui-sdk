// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { InvalidInputTestCases } from "../../__mocks__/typeGuards.js";

import { isComputedAttributeRef, isIdentifierRef, isLocalIdRef, isObjRef, isUriRef } from "./index.js";

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

    describe("isComputedAttributeRef", () => {
        const Scenarios: Array<[boolean, string, any]> = [
            ...InvalidInputTestCases,
            [true, "computed attribute ref", { identifier: "ca", type: "computedAttribute" }],
            [false, "label ref", { identifier: "ca", type: "displayForm" }],
            [false, "attribute ref", { identifier: "ca", type: "attribute" }],
            [false, "untyped identifier ref", { identifier: "ca" }],
            // a uri ref can never carry an object type, so it is never a computed attribute ref
            [false, "uri ref", { uri: "/gdc/md/obj/1" }],
            [false, "localId ref", { localIdentifier: "localId" }],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isComputedAttributeRef(input)).toBe(expectedResult);
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
