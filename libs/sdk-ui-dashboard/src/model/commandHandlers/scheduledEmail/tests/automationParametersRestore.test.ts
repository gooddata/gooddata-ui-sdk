// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { extractAutomationParameterChanges } from "../automationParametersRestore.js";

const topN = { ref: idRef("topN", "parameter"), value: 8 };
const limit = { ref: idRef("limit", "parameter"), value: 50 };
const scenario = { ref: idRef("scenario", "parameter"), value: "Budget" };

const bothFlagsOn = { enableParameters: true, enableStringParameters: true };

describe("extractAutomationParameterChanges", () => {
    it("maps alert parameters to a single active-tab descriptor (no tabLocalIdentifier)", () => {
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                alertParameters: [topN],
                exportParametersByTab: undefined,
                correlationId: "auto-1",
            }),
        ).toEqual([{ parameters: [topN], correlationId: "auto-1" }]);
    });

    it("maps each parametersByTab entry to a descriptor carrying that tab's id and converted values", () => {
        const result = extractAutomationParameterChanges({
            ...bothFlagsOn,
            alertParameters: undefined,
            exportParametersByTab: {
                "tab-A": [{ id: "topN", value: "8", title: "Top N", parameterType: "NUMBER" }],
                "tab-B": [{ id: "limit", value: "50", title: "Limit", parameterType: "NUMBER" }],
            },
            correlationId: "auto-2",
        });

        expect(result).toEqual([
            { parameters: [topN], tabLocalIdentifier: "tab-A", correlationId: "auto-2" },
            { parameters: [limit], tabLocalIdentifier: "tab-B", correlationId: "auto-2" },
        ]);
    });

    it("restores a STRING parameter's stored wire value as a string", () => {
        const result = extractAutomationParameterChanges({
            ...bothFlagsOn,
            alertParameters: undefined,
            exportParametersByTab: {
                "tab-A": [{ id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" }],
            },
            correlationId: "auto-6",
        });

        expect(result).toEqual([
            { parameters: [scenario], tabLocalIdentifier: "tab-A", correlationId: "auto-6" },
        ]);
    });

    it("restores a numeric-looking STRING value verbatim, without numeric coercion", () => {
        const result = extractAutomationParameterChanges({
            ...bothFlagsOn,
            alertParameters: undefined,
            exportParametersByTab: {
                "tab-A": [{ id: "scenario", value: "00123", title: "Scenario", parameterType: "STRING" }],
            },
            correlationId: "auto-8",
        });

        expect(result).toEqual([
            {
                parameters: [{ ref: idRef("scenario", "parameter"), value: "00123" }],
                tabLocalIdentifier: "tab-A",
                correlationId: "auto-8",
            },
        ]);
    });

    it("drops a STRING parameter's stored wire value while string parameters are disabled", () => {
        const result = extractAutomationParameterChanges({
            enableParameters: true,
            enableStringParameters: false,
            alertParameters: undefined,
            exportParametersByTab: {
                "tab-A": [{ id: "scenario", value: "Budget", title: "Scenario", parameterType: "STRING" }],
            },
            correlationId: "auto-7",
        });

        expect(result).toEqual([]);
    });

    it("returns no descriptors when enableParameters is false, even with stored params present", () => {
        expect(
            extractAutomationParameterChanges({
                enableParameters: false,
                enableStringParameters: true,
                alertParameters: [topN],
                exportParametersByTab: {
                    "tab-A": [{ id: "topN", value: "8", title: "Top N", parameterType: "NUMBER" }],
                },
                correlationId: "auto-3",
            }),
        ).toEqual([]);
    });

    it("returns no descriptors when alert params and the per-tab map are absent or empty", () => {
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                alertParameters: undefined,
                exportParametersByTab: undefined,
                correlationId: "auto-4",
            }),
        ).toEqual([]);
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                alertParameters: [],
                exportParametersByTab: {},
                correlationId: "auto-4",
            }),
        ).toEqual([]);
    });

    it("drops a tab whose stored values all parse to non-finite numbers", () => {
        const result = extractAutomationParameterChanges({
            ...bothFlagsOn,
            alertParameters: undefined,
            exportParametersByTab: {
                "tab-A": [{ id: "topN", value: "not-a-number", title: "Top N", parameterType: "NUMBER" }],
                "tab-B": [{ id: "limit", value: "50", title: "Limit", parameterType: "NUMBER" }],
            },
            correlationId: "auto-5",
        });

        expect(result).toEqual([
            { parameters: [limit], tabLocalIdentifier: "tab-B", correlationId: "auto-5" },
        ]);
    });
});
