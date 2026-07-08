// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { LimitReached, UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { extractBackendErrorDetail } from "../backendError.js";

describe("extractBackendErrorDetail", () => {
    it("returns the Tiger problem detail for an UnexpectedResponseError", () => {
        const error = new UnexpectedResponseError("Request failed with status code 400", 400, {
            detail: "Invalid MAQL expression near SELECT",
        });
        expect(extractBackendErrorDetail(error)).toBe("Invalid MAQL expression near SELECT");
    });

    it("ignores the transport-level message when an UnexpectedResponseError has no detail", () => {
        const error = new UnexpectedResponseError("Request failed with status code 500", 500, {});
        expect(extractBackendErrorDetail(error)).toBeUndefined();
    });

    it("preserves the curated message of other backend errors such as LimitReached", () => {
        const error = new LimitReached("The limit reached. Upgrade your plan to create more objects.");
        expect(extractBackendErrorDetail(error)).toBe(
            "The limit reached. Upgrade your plan to create more objects.",
        );
    });

    it("returns undefined for a plain, non-backend error", () => {
        expect(extractBackendErrorDetail(new Error("Network Error"))).toBeUndefined();
    });
});
