// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AnalyticalDashboardModelV2,
    type JsonApiAnalyticalDashboardOutDocument,
} from "@gooddata/api-client-tiger";
import { type IDashboardDefinition, type IDashboardParameter, idRef } from "@gooddata/sdk-model";

import { convertDashboard } from "../fromBackend/analyticalDashboards/v2/AnalyticalDashboardConverter.js";
import { convertAnalyticalDashboard } from "../toBackend/AnalyticalDashboardConverter.js";

const tigerRef = { identifier: { id: "topN", type: "parameter" } };

function makeDashboardDocument(
    content: AnalyticalDashboardModelV2.IAnalyticalDashboard,
): JsonApiAnalyticalDashboardOutDocument {
    return {
        data: {
            id: "dashboard-1",
            type: "analyticalDashboard",
            attributes: { title: "", description: "", content },
            relationships: {},
            meta: {},
        },
        links: { self: "https://example/dashboard-1" },
    };
}

function makeTigerContent(
    parameters: AnalyticalDashboardModelV2.IAnalyticalDashboard["parameters"],
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    return { version: "2", parameters };
}

function makeDashboardDefinition(parameters: IDashboardParameter[]): IDashboardDefinition {
    return {
        type: "IDashboard",
        title: "",
        description: "",
        shareStatus: "private",
        parameters,
    } as IDashboardDefinition;
}

describe("dashboard parameter converters", () => {
    describe("from backend", () => {
        it("converts a fully-specified parameter entry", () => {
            const doc = makeDashboardDocument(
                makeTigerContent([
                    {
                        ref: tigerRef as never,
                        parameterType: "NUMBER",
                        value: 25,
                        label: "Top N",
                        mode: "readonly",
                    },
                ]),
            );

            const dashboard = convertDashboard(doc);

            expect(dashboard.parameters).toEqual([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    value: 25,
                    label: "Top N",
                    mode: "readonly",
                },
            ]);
        });

        it("defaults mode to active when omitted", () => {
            const doc = makeDashboardDocument(
                makeTigerContent([
                    {
                        ref: tigerRef as never,
                        parameterType: "NUMBER",
                    },
                ]),
            );

            const dashboard = convertDashboard(doc);

            expect(dashboard.parameters).toEqual([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    mode: "active",
                },
            ]);
        });

        it("returns undefined parameters when content has none", () => {
            const doc = makeDashboardDocument({ version: "2" });
            const dashboard = convertDashboard(doc);
            expect(dashboard.parameters).toBeUndefined();
        });
    });

    describe("to backend", () => {
        it("preserves a fully-specified parameter entry", () => {
            const definition = makeDashboardDefinition([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    value: 25,
                    label: "Top N",
                    mode: "readonly",
                },
            ]);

            const result = convertAnalyticalDashboard(definition);

            expect(result.parameters).toEqual([
                {
                    ref: tigerRef,
                    parameterType: "NUMBER",
                    value: 25,
                    label: "Top N",
                    mode: "readonly",
                },
            ]);
        });

        it("omits mode field when set to active", () => {
            const definition = makeDashboardDefinition([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    mode: "active",
                },
            ]);

            const result = convertAnalyticalDashboard(definition);

            expect(result.parameters).toEqual([
                {
                    ref: tigerRef,
                    parameterType: "NUMBER",
                },
            ]);
        });

        it("emits no parameters field when none defined", () => {
            const definition = makeDashboardDefinition([]);
            const result = convertAnalyticalDashboard({ ...definition, parameters: undefined });
            expect(result.parameters).toBeUndefined();
        });
    });

    describe("round-trip", () => {
        it("preserves explicit value and label across to->from converters", () => {
            const definition = makeDashboardDefinition([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    value: 25,
                    label: "Top N",
                    mode: "active",
                },
            ]);

            const tigerContent = convertAnalyticalDashboard(definition);
            const dashboard = convertDashboard(makeDashboardDocument(tigerContent));

            expect(dashboard.parameters).toEqual(definition.parameters);
        });

        it("preserves a minimal entry (only ref+parameterType+active mode)", () => {
            const definition = makeDashboardDefinition([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    mode: "active",
                },
            ]);

            const tigerContent = convertAnalyticalDashboard(definition);
            const dashboard = convertDashboard(makeDashboardDocument(tigerContent));

            expect(dashboard.parameters).toEqual(definition.parameters);
        });
    });
});
