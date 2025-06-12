// (C) 2019 GoodData Corporation
import { describe, expect, it } from "vitest";
import { InvalidInputTestCases } from "../../../__mocks__/typeGuards.js";
import {
    DataTooLargeError,
    isAnalyticalBackendError,
    isDataTooLargeError,
    isNoDataError,
    isNotAuthenticated,
    isNotImplemented,
    isNotSupported,
    isProtectedDataError,
    isUnexpectedError,
    isUnexpectedResponseError,
    NoDataError,
    NotAuthenticated,
    NotImplemented,
    NotSupported,
    ProtectedDataError,
    UnexpectedError,
    UnexpectedResponseError,
} from "../index.js";

describe("result type guards", () => {
    describe("isAnalyticalBackendError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [true, "no data error", new NoDataError("fail")],
            [true, "data too large error", new DataTooLargeError("fail")],
            [true, "protected data", new ProtectedDataError("fail")],
            [true, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [true, "unexpected error", new UnexpectedError("fail")],
            [true, "not supported error", new NotSupported("fail")],
            [true, "not implemented error", new NotImplemented("fail")],
            [true, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAnalyticalBackendError(input)).toBe(expectedResult);
        });
    });

    describe("isNoDataError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [true, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNoDataError(input)).toBe(expectedResult);
        });
    });

    describe("isDataTooLargeError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [true, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDataTooLargeError(input)).toBe(expectedResult);
        });
    });

    describe("isProtectedDataError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [true, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isProtectedDataError(input)).toBe(expectedResult);
        });
    });

    describe("isUnexpectedHttpError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [true, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isUnexpectedResponseError(input)).toBe(expectedResult);
        });
    });

    describe("isUnexpectedError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [true, "unexpected error", new UnexpectedError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isUnexpectedError(input)).toBe(expectedResult);
        });
    });

    describe("isNotSupported", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedResponseError("fail", 400, "")],
            [true, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNotSupported(input)).toBe(expectedResult);
        });
    });

    describe("isNotImplemented", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedResponseError("fail", 400, "")],
            [false, "not supported error", new NotSupported("fail")],
            [true, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNotImplemented(input)).toBe(expectedResult);
        });
    });

    describe("isNotAuthenticated", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "no data error", new NoDataError("fail")],
            [false, "data too large error", new DataTooLargeError("fail")],
            [false, "protected data", new ProtectedDataError("fail")],
            [false, "unexpected response", new UnexpectedResponseError("fail", 400, "")],
            [false, "unexpected error", new UnexpectedResponseError("fail", 400, "")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [true, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNotAuthenticated(input)).toBe(expectedResult);
        });
    });
});
