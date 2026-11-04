// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { formatValue } from "./formatter.js";

describe("formatValue", () => {
    it("formats SQL", () => {
        expect(formatValue("select a from t")).toBe("select\n    a\nfrom\n    t");
    });

    it("returns text the formatter cannot parse as it is", () => {
        expect(formatValue("SELECT ((")).toBe("SELECT ((");
    });
});
