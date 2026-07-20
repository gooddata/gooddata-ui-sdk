// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import { type IDashboardExportParameter, idRef } from "@gooddata/sdk-model";

import { exportParametersToValues } from "../index.js";

describe("exportParametersToValues", () => {
    it("parses a NUMBER-tagged wire value to a number and refs the parameter by id", () => {
        const stored: IDashboardExportParameter[] = [
            { id: "topN", value: "8", title: "Top N", parameterType: "NUMBER" },
            { id: "limit", value: "50", title: "Limit", parameterType: "NUMBER" },
        ];
        expect(exportParametersToValues(stored, true)).toEqual([
            { ref: idRef("topN", "parameter"), value: 8 },
            { ref: idRef("limit", "parameter"), value: 50 },
        ]);
    });

    it("keeps a STRING-tagged wire value as a string, even a numeric-looking one", () => {
        const stored: IDashboardExportParameter[] = [
            { id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" },
            { id: "scenario", value: "42", title: "Scenario", parameterType: "STRING" },
        ];
        expect(exportParametersToValues(stored, true)).toEqual([
            { ref: idRef("scenario", "parameter"), value: "Budget" },
            { ref: idRef("scenario", "parameter"), value: "42" },
        ]);
    });

    it("drops entries whose NUMBER wire value is not a finite number", () => {
        const stored: IDashboardExportParameter[] = [
            { id: "topN", value: "not-a-number", title: "Top N", parameterType: "NUMBER" },
            { id: "limit", value: "5", title: "Limit", parameterType: "NUMBER" },
        ];
        expect(exportParametersToValues(stored, true)).toEqual([
            { ref: idRef("limit", "parameter"), value: 5 },
        ]);
    });

    it("decodes untagged rows as NUMBER (persisted before the type tag existed)", () => {
        const stored: IDashboardExportParameter[] = [
            { id: "topN", value: "7", title: "Top N" },
            { id: "scenario", value: "Budget", title: "Scenario" },
        ];
        expect(exportParametersToValues(stored, true)).toEqual([
            { ref: idRef("topN", "parameter"), value: 7 },
        ]);
    });

    it("drops STRING rows while string parameters are disabled", () => {
        const stored: IDashboardExportParameter[] = [
            { id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" },
            { id: "topN", value: "3", title: "Top N", parameterType: "NUMBER" },
        ];
        expect(exportParametersToValues(stored, false)).toEqual([
            { ref: idRef("topN", "parameter"), value: 3 },
        ]);
    });

    it("drops rows tagged with a type this version does not know (persisted by a newer one)", () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const stored: (Omit<IDashboardExportParameter, "parameterType"> & { parameterType: string })[] = [
            { id: "asOf", value: "2026-01-01", title: "As of", parameterType: "DATE" },
            { id: "topN", value: "3", title: "Top N", parameterType: "NUMBER" },
        ];
        expect(exportParametersToValues(stored as IDashboardExportParameter[], true)).toEqual([
            { ref: idRef("topN", "parameter"), value: 3 },
        ]);
        expect(consoleError).toHaveBeenCalledOnce();
        consoleError.mockRestore();
    });
});
