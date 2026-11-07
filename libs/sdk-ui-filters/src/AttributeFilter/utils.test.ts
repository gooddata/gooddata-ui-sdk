// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { getDateFormattedElementRawTitle } from "./utils.js";

describe("getDateFormattedElementRawTitle", () => {
    const computedAttributeRef = idRef("last_date", "computedAttribute");

    it("should return the raw value of a date-formatted computed attribute element", () => {
        expect(
            getDateFormattedElementRawTitle(
                { title: "2026-08-24T00:00", uri: "2026-08-24T00:00", formattedTitle: "24.08.2026" },
                computedAttributeRef,
            ),
        ).toBe("2026-08-24T00:00");
    });

    it("should return nothing for an element of a date attribute", () => {
        expect(
            getDateFormattedElementRawTitle(
                { title: "2026-08", uri: "2026-08", formattedTitle: "Aug 2026" },
                idRef("date.month", "attribute"),
            ),
        ).toBeUndefined();
    });

    it.each([
        ["without a formatted value", { title: "2026-08-24T00:00", uri: "2026-08-24T00:00" }],
        [
            "shown as its raw value",
            { title: "2026-08-24T00:00", uri: "2026-08-24T00:00", formattedTitle: "2026-08-24T00:00" },
        ],
        ["with an empty value", { title: null, uri: null, formattedTitle: "" }],
    ])("should return nothing for a computed attribute element %s", (_, element) => {
        expect(getDateFormattedElementRawTitle(element, computedAttributeRef)).toBeUndefined();
    });

    it("should return nothing without an attribute", () => {
        expect(
            getDateFormattedElementRawTitle(
                { title: "2026-08-24T00:00", uri: "2026-08-24T00:00", formattedTitle: "24.08.2026" },
                undefined,
            ),
        ).toBeUndefined();
    });
});
