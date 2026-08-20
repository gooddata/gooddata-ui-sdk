// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { convertExportMetadata } from "../ExportMetadataConverter.js";

const PARAMS = [{ id: "topN", value: "25", title: "Top N" }];

describe("convertExportMetadata — parameter overrides", () => {
    it("reads parametersByTab from the metadata blob", () => {
        const result = convertExportMetadata({ parametersByTab: { "tab-A": PARAMS } });
        expect(result?.parametersByTab).toEqual({ "tab-A": PARAMS });
    });

    it("omits parametersByTab when the metadata carries no parameters", () => {
        const result = convertExportMetadata({ title: "Export" });
        expect(result).not.toHaveProperty("parametersByTab");
    });
});

describe("convertExportMetadata — timezone", () => {
    it("reads timezoneId from the metadata blob", () => {
        const result = convertExportMetadata({ timezoneId: "Europe/Prague" });
        expect(result?.timezoneId).toBe("Europe/Prague");
    });

    it("omits timezoneId when the metadata carries no timezone", () => {
        const result = convertExportMetadata({ title: "Export" });
        expect(result).not.toHaveProperty("timezoneId");
    });
});
