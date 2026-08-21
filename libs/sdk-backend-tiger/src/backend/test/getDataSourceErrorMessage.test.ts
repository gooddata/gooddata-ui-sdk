// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { getDataSourceErrorMessage } from "../tigerSpecificFunctions.js";

const axios400 = (detail?: unknown) =>
    Object.assign(new Error("Request failed with status code 400"), {
        response: { status: 400, data: detail === undefined ? {} : { detail } },
    });

describe("getDataSourceErrorMessage", () => {
    it("prefers the API problem detail over the generic axios message", () => {
        // The detail names the offending field and constraint; the axios message only carries the
        // status code, which used to be all the data source dialogs showed (CQ-2846).
        expect(
            getDataSourceErrorMessage(
                axios400("cacheRetention.validityPeriod PT1M is shorter than the minimum allowed PT5M."),
            ),
        ).toBe("cacheRetention.validityPeriod PT1M is shorter than the minimum allowed PT5M.");
    });

    it("falls back to the error message when the response has no detail", () => {
        expect(getDataSourceErrorMessage(axios400())).toBe("Request failed with status code 400");
    });

    it("ignores a detail that is not a string", () => {
        expect(getDataSourceErrorMessage(axios400(42))).toBe("Request failed with status code 400");
    });

    it("treats an empty detail as absent", () => {
        expect(getDataSourceErrorMessage(axios400(""))).toBe("Request failed with status code 400");
    });

    it("treats a whitespace-only detail as absent", () => {
        expect(getDataSourceErrorMessage(axios400("   "))).toBe("Request failed with status code 400");
    });

    it("keeps plain errors and non-errors readable", () => {
        expect(getDataSourceErrorMessage(new Error("boom"))).toBe("boom");
        expect(getDataSourceErrorMessage("boom")).toBe("boom");
    });
});
