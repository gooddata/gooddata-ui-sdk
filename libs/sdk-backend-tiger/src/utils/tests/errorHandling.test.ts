// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { convertApiError } from "../errorHandling.js";

describe("errorHandling", () => {
    describe("convertApiError", () => {
        it("convert to UnexpectedResponseError correctly", () => {
            const traceId = "adi_MSLFlr0ipb_74FAYdvoR1";
            const status = 500;
            const data = {
                traceId,
                message: "Internal server error",
                status: 500,
                detail: "Contact your administrator for more information",
            };

            const apiError = {
                message: "Internal server error",
                name: "API Error",
                response: {
                    status,
                    headers: {
                        "x-gdc-trace-id": traceId,
                        "x-gdc-token": "token_MSLFlr0ipb_74FAYdvoR1",
                    },
                    data,
                },
            };
            const error = convertApiError(apiError);

            expect(error instanceof UnexpectedResponseError).toBeTruthy();
            const unexpectedResponseError = error as UnexpectedResponseError;

            expect(unexpectedResponseError.httpStatus).toBe(500);
            expect(unexpectedResponseError.traceId).toEqual(traceId);
            expect(unexpectedResponseError.responseBody).toEqual(data);
        });
    });
});
