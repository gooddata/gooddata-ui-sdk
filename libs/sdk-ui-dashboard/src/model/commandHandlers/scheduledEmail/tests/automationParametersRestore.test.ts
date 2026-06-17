// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import { extractAutomationParameterChanges } from "../automationParametersRestore.js";

const topN = { ref: idRef("topN", "parameter"), value: 8 };
const limit = { ref: idRef("limit", "parameter"), value: 50 };

describe("extractAutomationParameterChanges", () => {
    it("maps alert parameters to a single active-tab descriptor (no tabLocalIdentifier)", () => {
        expect(extractAutomationParameterChanges(true, [topN], undefined, "auto-1")).toEqual([
            { parameters: [topN], correlationId: "auto-1" },
        ]);
    });

    it("maps each parametersByTab entry to a descriptor carrying that tab's id and converted values", () => {
        const result = extractAutomationParameterChanges(
            true,
            undefined,
            {
                "tab-A": [{ id: "topN", value: "8", title: "Top N" }],
                "tab-B": [{ id: "limit", value: "50", title: "Limit" }],
            },
            "auto-2",
        );

        expect(result).toEqual([
            { parameters: [topN], tabLocalIdentifier: "tab-A", correlationId: "auto-2" },
            { parameters: [limit], tabLocalIdentifier: "tab-B", correlationId: "auto-2" },
        ]);
    });

    it("returns no descriptors when enableParameters is false, even with stored params present", () => {
        expect(
            extractAutomationParameterChanges(
                false,
                [topN],
                { "tab-A": [{ id: "topN", value: "8", title: "Top N" }] },
                "auto-3",
            ),
        ).toEqual([]);
    });

    it("returns no descriptors when alert params and the per-tab map are absent or empty", () => {
        expect(extractAutomationParameterChanges(true, undefined, undefined, "auto-4")).toEqual([]);
        expect(extractAutomationParameterChanges(true, [], {}, "auto-4")).toEqual([]);
    });

    it("drops a tab whose stored values all parse to non-finite numbers", () => {
        const result = extractAutomationParameterChanges(
            true,
            undefined,
            {
                "tab-A": [{ id: "topN", value: "not-a-number", title: "Top N" }],
                "tab-B": [{ id: "limit", value: "50", title: "Limit" }],
            },
            "auto-5",
        );

        expect(result).toEqual([
            { parameters: [limit], tabLocalIdentifier: "tab-B", correlationId: "auto-5" },
        ]);
    });
});
