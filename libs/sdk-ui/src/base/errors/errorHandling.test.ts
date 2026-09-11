// (C) 2007-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    ContractExpired,
    DataTooLargeError,
    NoDataError,
    NotAuthenticated,
    ProtectedDataError,
    UnexpectedResponseError,
} from "@gooddata/sdk-backend-spi";

import { convertError } from "./errorHandling.js";
import {
    type ContractExpiredSdkError,
    ErrorCodes,
    UnexpectedSdkError,
    isContractExpiredSdkError,
} from "./GoodDataSdkError.js";

describe("convertErrors", () => {
    const Scenarios: Array<[string, any, string]> = [
        ["unexpected 400 response", new UnexpectedResponseError("test", 400, {}), ErrorCodes.BAD_REQUEST],
        ["unexpected 404 response", new UnexpectedResponseError("test", 404, {}), ErrorCodes.NOT_FOUND],
        ["unexpected 501", new UnexpectedResponseError("test", 501, {}), ErrorCodes.UNKNOWN_ERROR],
        ["no data", new NoDataError("no data"), ErrorCodes.NO_DATA],
        [
            "data too large",
            new DataTooLargeError("data view too large"),
            ErrorCodes.DATA_TOO_LARGE_TO_COMPUTE,
        ],
        ["protected data", new ProtectedDataError("access denied"), ErrorCodes.PROTECTED_REPORT],
        ["unauthenticated", new NotAuthenticated("access denied"), ErrorCodes.UNAUTHORIZED],
        ["contract expired", new ContractExpired("TRIAL"), ErrorCodes.CONTRACT_EXPIRED],
        ["bogus object", {}, ErrorCodes.UNKNOWN_ERROR],
        ["bogus string", "fun times", ErrorCodes.UNKNOWN_ERROR],
    ];

    it.each(Scenarios)("should convert %s", (_desc, input, output) => {
        expect(convertError(input).message).toBe(output);
    });

    it("moves the contract tier off the message and onto the error", () => {
        const converted = convertError(new ContractExpired("TRIAL"));

        expect(isContractExpiredSdkError(converted)).toBe(true);
        expect((converted as ContractExpiredSdkError).tier).toBe("TRIAL");
    });

    it("leaves GoodDataSdkError as is", () => {
        const error = new UnexpectedSdkError("test");

        expect(convertError(error)).toBe(error);
    });
});
