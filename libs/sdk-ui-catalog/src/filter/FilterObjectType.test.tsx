// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { isCountKnown } from "./FilterObjectType.js";

describe("isCountKnown", () => {
    it.each([
        ["success", true],
        ["loadingMore", true],
        ["idle", false],
        ["loading", false],
        ["error", false],
    ] as const)("status %s has known counts: %s", (status, expected) => {
        expect(isCountKnown(status)).toBe(expected);
    });
});
