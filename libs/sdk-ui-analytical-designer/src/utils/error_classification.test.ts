// (C) 2026 GoodData Corporation

// @vitest-environment node
import { describe, expect, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";
import { BadRequestSdkError } from "@gooddata/sdk-ui";

import { isSemanticBackendError } from "./error_classification.js";

describe("isSemanticBackendError", () => {
    it("returns true for a direct UnexpectedResponseError with 4xx status", () => {
        const error = new UnexpectedResponseError("Bad request", 400, {});
        expect(isSemanticBackendError(error)).toBe(true);
    });

    it("returns false for a direct UnexpectedResponseError with 5xx status", () => {
        const error = new UnexpectedResponseError("Server error", 500, {});
        expect(isSemanticBackendError(error)).toBe(false);
    });

    it("returns true for a GoodDataSdkError whose getCause() is an UnexpectedResponseError with 4xx status", () => {
        const cause = new UnexpectedResponseError("Not found", 404, {});
        const error = new BadRequestSdkError("wrapped", cause);
        expect(isSemanticBackendError(error)).toBe(true);
    });

    it("returns true for a plain Error wrapping an UnexpectedResponseError via native ES2022 cause", () => {
        const cause = new UnexpectedResponseError("Unprocessable", 422, {});
        const error = new Error("wrap", { cause });
        expect(isSemanticBackendError(error)).toBe(true);
    });

    it("returns false for a plain Error with no recognisable HTTP status (e.g., network down)", () => {
        expect(isSemanticBackendError(new Error("network down"))).toBe(false);
    });

    it("returns false for undefined", () => {
        expect(isSemanticBackendError(undefined)).toBe(false);
    });
});
