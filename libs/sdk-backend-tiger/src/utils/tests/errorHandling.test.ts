// (C) 2023-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { UnexpectedResponseError, isPermissionEscalationRefused } from "@gooddata/sdk-backend-spi";

import { convertApiError } from "../errorHandling.js";

describe("errorHandling", () => {
    describe("convertApiError", () => {
        // Captured verbatim from staging (dev-latest, 18 Aug 2026): a caller holding SHARE
        // on an object tried to grant EDIT. The classifier matches this response's `detail`,
        // so keep this payload as recorded — if a Tiger release changes the wording, this
        // test is what shows it, and the refusal would otherwise fall back to the generic
        // error in the UI. Replace with the error code once the API reports one.
        const REFUSED_OVER_GRANT_RESPONSE = {
            status: 400,
            detail: "Request modifies permissions with higher level than the current user's: [EDIT]",
            title: "Bad Request",
            type: "about:blank",
        };

        it("converts a refused over-grant into PermissionEscalationRefused", () => {
            const error = convertApiError({
                message: "Bad Request",
                name: "API Error",
                response: {
                    status: 400,
                    headers: {},
                    data: REFUSED_OVER_GRANT_RESPONSE,
                },
            } as Parameters<typeof convertApiError>[0]);

            expect(isPermissionEscalationRefused(error)).toBe(true);
        });

        it("leaves another 400 as an UnexpectedResponseError", () => {
            const error = convertApiError({
                message: "Bad Request",
                name: "API Error",
                response: {
                    status: 400,
                    headers: {},
                    data: { status: 400, detail: "Something else entirely" },
                },
            } as Parameters<typeof convertApiError>[0]);

            expect(isPermissionEscalationRefused(error)).toBe(false);
            expect(error instanceof UnexpectedResponseError).toBeTruthy();
        });

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
