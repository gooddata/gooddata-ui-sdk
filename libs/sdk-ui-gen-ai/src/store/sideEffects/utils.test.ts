// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { extractError, extractErrorContent } from "./utils.js";

describe("sideEffects utils", () => {
    describe("extractError", () => {
        it("extracts error message from standard Error", () => {
            const err = new Error("Something broke");
            expect(extractError(err)).toBe("Error: Something broke");
        });

        it("extracts detail from UnexpectedResponseError response body if available", () => {
            const err = new UnexpectedResponseError("Generic message", 503, {
                detail: "Inference gateway is unavailable",
            });
            expect(extractError(err)).toBe("Error: Inference gateway is unavailable");
        });
    });

    describe("extractErrorContent", () => {
        it("extracts full error content from UnexpectedResponseError", () => {
            const err = new UnexpectedResponseError(
                "Request failed",
                503,
                {
                    detail: "Gateway down",
                    reason: "SERVICE_UNAVAILABLE",
                    traceId: "trace-123",
                },
                "trace-123",
            );

            const content = extractErrorContent(err);
            expect(content).toEqual({
                type: "error",
                message: "Error: Gateway down",
                code: 503,
                traceId: "trace-123",
                reason: "SERVICE_UNAVAILABLE",
            });
        });

        it("extracts error content from basic Error", () => {
            const err = new Error("Generic failure");
            const content = extractErrorContent(err);
            expect(content).toEqual({
                type: "error",
                message: "Error: Generic failure",
            });
        });

        it("extracts error content from string / unknown", () => {
            const content = extractErrorContent("String error");
            expect(content).toEqual({
                type: "error",
                message: "String error",
            });
        });
    });
});
