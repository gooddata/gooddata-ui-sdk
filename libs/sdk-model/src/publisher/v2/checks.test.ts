// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type Issues, describeValue, nonEmptyString, objectOf, optional, trueOrFalse } from "./checks.js";

describe("objectOf", () => {
    it("does not type a key the object lacks, which the check would accept", () => {
        const extraKeys = { extra: optional(trueOrFalse) };
        // @ts-expect-error "extra" is not a key of the checked type
        const check = objectOf<{ name?: string }>()({ name: optional(nonEmptyString), ...extraKeys });
        const issues: Issues = [];

        check({ extra: true }, "", issues);

        expect(issues).toEqual([]);
    });
});

describe("describeValue", () => {
    it("cuts a long value to 80 characters", () => {
        const description = describeValue("x".repeat(200));

        expect(description).toHaveLength(80);
        expect(description.endsWith("…")).toBe(true);
    });

    it("keeps a value of 80 characters whole", () => {
        const value = "x".repeat(78);

        expect(describeValue(value)).toBe(JSON.stringify(value));
    });
});
