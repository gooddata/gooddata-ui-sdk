// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { UnexpectedResponseError } from "@gooddata/sdk-backend-spi";

import { deriveCopyIdentity, isDuplicateIdError } from "../copy.js";

describe("deriveCopyIdentity", () => {
    it("appends a (2) suffix to a plain title", () => {
        expect(deriveCopyIdentity({ title: "Foo" })).toEqual({ title: "Foo (2)" });
    });

    it("increments an existing (N) suffix", () => {
        expect(deriveCopyIdentity({ title: "Foo (2)" })).toEqual({ title: "Foo (3)" });
    });

    it("keeps an empty title empty", () => {
        expect(deriveCopyIdentity({ title: "" })).toEqual({ title: "" });
    });

    it("omits both fields when the source has neither", () => {
        expect(deriveCopyIdentity({})).toEqual({});
    });

    it("omits the id when the source id is a canonical uuid", () => {
        const copy = deriveCopyIdentity({ id: "12345678-1234-1234-1234-123456789012", title: "Foo" });
        expect(copy).not.toHaveProperty("id");
        expect(copy).toEqual({ title: "Foo (2)" });
    });

    it("re-derives a human-authored id from the copied title", () => {
        expect(deriveCopyIdentity({ id: "revenue.total", title: "Total Revenue" })).toEqual({
            id: "total_revenue__2_",
            title: "Total Revenue (2)",
        });
    });

    it("omits the id when the source has none, even for a titled source", () => {
        const copy = deriveCopyIdentity({ title: "Foo" });
        expect(copy).not.toHaveProperty("id");
    });
});

describe("isDuplicateIdError", () => {
    it("is true for a 409 backend response", () => {
        expect(isDuplicateIdError(new UnexpectedResponseError("Conflict", 409, {}))).toBe(true);
    });

    it("is false for a non-409 backend response", () => {
        expect(isDuplicateIdError(new UnexpectedResponseError("Server error", 500, {}))).toBe(false);
    });

    it("is false for a plain error", () => {
        expect(isDuplicateIdError(new Error("nope"))).toBe(false);
    });
});
