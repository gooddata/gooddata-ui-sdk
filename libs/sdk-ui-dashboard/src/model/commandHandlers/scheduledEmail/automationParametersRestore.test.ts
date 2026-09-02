// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { idRef } from "@gooddata/sdk-model";

import {
    workspaceNumberParameter,
    workspaceStringParameter,
} from "../../../presentation/automations/tests/parameterFixtures.test.helpers.js";

import { extractAutomationParameterChanges } from "./automationParametersRestore.js";

const topN = { ref: idRef("topN", "parameter"), value: 8 };
const limit = { ref: idRef("limit", "parameter"), value: 50 };
const scenario = { ref: idRef("scenario", "parameter"), value: "Budget" };

const catalog = [
    workspaceNumberParameter("topN", "Top N", 3),
    workspaceNumberParameter("limit", "Limit", 50),
    workspaceStringParameter("scenario", "Scenario", "Actual"),
];

const bothFlagsOn = { enableParameters: true, enableStringParameters: true, catalog, catalogIsLoaded: true };

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

    it("decodes untyped alert wire strings against the catalog definition", () => {
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                alertParameters: [
                    { ref: idRef("topN", "parameter"), value: "8" },
                    { ref: idRef("scenario", "parameter"), value: "007" },
                ],
                exportParametersByTab: undefined,
                correlationId: "auto-9",
            }),
        ).toEqual([
            {
                parameters: [
                    { ref: idRef("topN", "parameter"), value: 8 },
                    { ref: idRef("scenario", "parameter"), value: "007" },
                ],
                correlationId: "auto-9",
            },
        ]);
    });

    it("restores an alert STRING parameter saved with an empty value as an empty string (F1-2735)", () => {
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                alertParameters: [{ ref: idRef("scenario", "parameter"), value: "" }],
                exportParametersByTab: undefined,
                correlationId: "auto-10",
            }),
        ).toEqual([
            {
                parameters: [{ ref: idRef("scenario", "parameter"), value: "" }],
                correlationId: "auto-10",
            },
        ]);
    });

    it("skips alert rows whose ref left the catalog or whose value does not decode", () => {
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                alertParameters: [
                    { ref: idRef("removed", "parameter"), value: "8" },
                    { ref: idRef("topN", "parameter"), value: "not-a-number" },
                    { ref: idRef("limit", "parameter"), value: "50" },
                ],
                exportParametersByTab: undefined,
                correlationId: "auto-11",
            }),
        ).toEqual([{ parameters: [limit], correlationId: "auto-11" }]);
    });

    it("skips the alert restore instead of pruning when the catalog did not load", () => {
        // Decoding against a failed/empty catalog would wipe every override; export rows carry
        // their own type tags, so their restore is unaffected.
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                catalog: [],
                catalogIsLoaded: false,
                alertParameters: [topN, { ref: idRef("scenario", "parameter"), value: "Budget" }],
                exportParametersByTab: {
                    "tab-A": [{ id: "limit", value: "50", title: "Limit", parameterType: "NUMBER" }],
                },
                correlationId: "auto-13",
            }),
        ).toEqual([{ parameters: [limit], tabLocalIdentifier: "tab-A", correlationId: "auto-13" }]);
    });

    it("skips alert STRING rows while string parameters are disabled", () => {
        expect(
            extractAutomationParameterChanges({
                ...bothFlagsOn,
                enableStringParameters: false,
                alertParameters: [{ ref: idRef("scenario", "parameter"), value: "Budget" }],
                exportParametersByTab: undefined,
                correlationId: "auto-12",
            }),
        ).toEqual([]);
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
            ...bothFlagsOn,
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
                ...bothFlagsOn,
                enableParameters: false,
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

    it('drops a malformed row with a null value instead of throwing or restoring "null"', () => {
        const result = extractAutomationParameterChanges({
            ...bothFlagsOn,
            alertParameters: [
                { ref: idRef("topN", "parameter"), value: null as unknown as string },
                { ref: idRef("scenario", "parameter"), value: null as unknown as string },
            ],
            exportParametersByTab: {
                "tab-A": [
                    { id: "topN", value: null as unknown as string, title: "Top N", parameterType: "NUMBER" },
                    {
                        id: "scenario",
                        value: null as unknown as string,
                        title: "Scenario",
                        parameterType: "STRING",
                    },
                    { id: "limit", value: "50", title: "Limit", parameterType: "NUMBER" },
                ],
            },
            correlationId: "auto-14",
        });

        expect(result).toEqual([
            { parameters: [limit], tabLocalIdentifier: "tab-A", correlationId: "auto-14" },
        ]);
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
