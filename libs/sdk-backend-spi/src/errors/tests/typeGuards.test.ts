// (C) 2019 GoodData Corporation

import { InvalidInputTestCases } from "../../../__mocks__/typeGuards";
import {
    DataViewError,
    ExecutionError,
    isAnalyticalBackendError,
    NotImplemented,
    NotSupported,
    NotAuthenticated,
    isExecutionError,
    isDataViewError,
    isNotSupported,
    isNotImplemented,
    isNotAuthenticated,
} from "../index";

describe("result type guards", () => {
    describe("isAnalyticalBackendError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [true, "execution error", new ExecutionError("fail")],
            [true, "data view error", new DataViewError("fail")],
            [true, "not supported error", new NotSupported("fail")],
            [true, "not implemented error", new NotImplemented("fail")],
            [true, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isAnalyticalBackendError(input)).toBe(expectedResult);
        });
    });

    describe("isExecutionError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [true, "execution error", new ExecutionError("fail")],
            [false, "data view error", new DataViewError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isExecutionError(input)).toBe(expectedResult);
        });
    });

    describe("isDataViewError", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "execution error", new ExecutionError("fail")],
            [true, "data view error", new DataViewError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [false, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isDataViewError(input)).toBe(expectedResult);
        });
    });

    describe("isNotSupported", () => {
        const Scenarios: Array<[boolean, string, Error | any]> = [
            ...InvalidInputTestCases,
            [false, "execution error", new ExecutionError("fail")],
            [false, "data view error", new DataViewError("fail")],
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
            [false, "execution error", new ExecutionError("fail")],
            [false, "data view error", new DataViewError("fail")],
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
            [false, "execution error", new ExecutionError("fail")],
            [false, "data view error", new DataViewError("fail")],
            [false, "not supported error", new NotSupported("fail")],
            [false, "not implemented error", new NotImplemented("fail")],
            [true, "not authenticated", new NotAuthenticated("fail")],
        ];

        it.each(Scenarios)("should return %s when input is %s", (expectedResult, _desc, input) => {
            expect(isNotAuthenticated(input)).toBe(expectedResult);
        });
    });
});
