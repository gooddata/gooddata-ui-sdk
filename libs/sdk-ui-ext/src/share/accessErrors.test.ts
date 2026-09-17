// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { isPermissionsNotAvailable } from "./accessErrors.js";

describe("isPermissionsNotAvailable", () => {
    it.each([403, 404])("treats HTTP %i from the manage-gated endpoint as a definitive no", (status) => {
        expect(isPermissionsNotAvailable(new UnexpectedResponseError("denied", status, {}))).toBe(true);
    });

    it.each([500, 502, 501, 401])("treats HTTP %i as transient", (status) => {
        expect(isPermissionsNotAvailable(new UnexpectedResponseError("boom", status, {}))).toBe(false);
    });

    it("ignores errors that are not HTTP responses", () => {
        expect(isPermissionsNotAvailable(new Error("network"))).toBe(false);
        expect(isPermissionsNotAvailable(undefined)).toBe(false);
    });
});
