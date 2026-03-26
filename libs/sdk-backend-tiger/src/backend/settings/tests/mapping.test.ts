// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { mapTypeToKey } from "../mapping.js";

describe("settings mapping", () => {
    it("should map EXPORT_CSV_CUSTOM_DELIMITER to exportCsvCustomDelimiter", () => {
        expect(mapTypeToKey("EXPORT_CSV_CUSTOM_DELIMITER")).toBe("exportCsvCustomDelimiter");
    });
});
