// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type AnalyticalDashboardModelV2,
    type JsonApiAnalyticalDashboardOutDocument,
} from "@gooddata/api-client-tiger";
import {
    type IDashboardDefinition,
    type IDashboardParameter,
    type IDashboardTab,
    idRef,
} from "@gooddata/sdk-model";

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

function makeTigerContentRootOnly(
    parameters: AnalyticalDashboardModelV2.IAnalyticalDashboard["parameters"],
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    return { version: "2", parameters };
}

function makeTigerContentWithTabs(
    tabs: AnalyticalDashboardModelV2.IDashboardTab[],
): AnalyticalDashboardModelV2.IAnalyticalDashboard {
    return { version: "2", tabs };
}

function makeTigerTab(
    localIdentifier: string,
    parameters?: AnalyticalDashboardModelV2.IDashboardTab["parameters"],
): AnalyticalDashboardModelV2.IDashboardTab {
    return {
        localIdentifier,
        title: "",
        layout: { type: "IDashboardLayout", sections: [] } as never,
        filterContextRef: {} as never,
        ...(parameters ? { parameters } : {}),
    };
}

function makeDashboardDefinitionWithTabs(tabs: IDashboardTab[]): IDashboardDefinition {
    return {
        type: "IDashboard",
        title: "",
        description: "",
        shareStatus: "private",
        tabs,
    } as IDashboardDefinition;
}

function makeTab(localIdentifier: string, parameters?: IDashboardParameter[]): IDashboardTab {
    return {
        localIdentifier,
        title: "",
        ...(parameters ? { parameters } : {}),
    } as IDashboardTab;
}

describe("dashboard parameter converters", () => {
    describe("from backend", () => {
        it("V1: reads root parameters when no tabs[]", () => {
            const doc = makeDashboardDocument(
                makeTigerContentRootOnly([
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

        it("V2: reads each tab's parameters per tab", () => {
            const doc = makeDashboardDocument(
                makeTigerContentWithTabs([
                    makeTigerTab("tab-A", [{ ref: tigerRef as never, parameterType: "NUMBER", value: 25 }]),
                    makeTigerTab("tab-B"),
                ]),
            );

            const dashboard = convertDashboard(doc);

            expect(dashboard.tabs?.[0]?.parameters).toEqual([
                {
                    ref: idRef("topN", "parameter"),
                    parameterType: "NUMBER",
                    value: 25,
                    mode: "active",
                },
            ]);
            expect(dashboard.tabs?.[1]?.parameters).toBeUndefined();
        });

        it("defaults mode to active when omitted on a tab parameter", () => {
            const doc = makeDashboardDocument(
                makeTigerContentWithTabs([
                    makeTigerTab("tab-A", [{ ref: tigerRef as never, parameterType: "NUMBER" }]),
                ]),
            );

            const dashboard = convertDashboard(doc);

            expect(dashboard.tabs?.[0]?.parameters?.[0]?.mode).toBe("active");
        });

        it("returns undefined parameters when neither root nor any tab has them", () => {
            const doc = makeDashboardDocument({ version: "2" });
            const dashboard = convertDashboard(doc);
            expect(dashboard.parameters).toBeUndefined();
            expect(dashboard.tabs).toBeUndefined();
        });
    });

    describe("to backend", () => {
        it("V2: writes parameters per tab and mirrors tabs[0] to root for V1 readers", () => {
            const definition = makeDashboardDefinitionWithTabs([
                makeTab("tab-A", [
                    {
                        ref: idRef("topN", "parameter"),
                        parameterType: "NUMBER",
                        value: 25,
                        label: "Top N",
                        mode: "readonly",
                    },
                ]),
                makeTab("tab-B"),
            ]);

            const result = convertAnalyticalDashboard(definition);

            const tigerTopN = {
                ref: tigerRef,
                parameterType: "NUMBER",
                value: 25,
                label: "Top N",
                mode: "readonly",
            };
            expect(result.parameters).toEqual([tigerTopN]);
            expect(result.tabs?.[0]?.parameters).toEqual([tigerTopN]);
            expect(result.tabs?.[1]?.parameters).toBeUndefined();
        });

        it("V2: writes root parameters when definition has no tabs (legacy root-only)", () => {
            const definition = {
                type: "IDashboard",
                title: "",
                description: "",
                shareStatus: "private",
                parameters: [
                    {
                        ref: idRef("topN", "parameter"),
                        parameterType: "NUMBER",
                        value: 25,
                        label: "Top N",
                        mode: "readonly",
                    },
                ],
            } as IDashboardDefinition;

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
            expect(result.tabs).toBeUndefined();
        });

        it("omits mode field when set to active on a tab parameter", () => {
            const definition = makeDashboardDefinitionWithTabs([
                makeTab("tab-A", [
                    {
                        ref: idRef("topN", "parameter"),
                        parameterType: "NUMBER",
                        mode: "active",
                    },
                ]),
            ]);

            const result = convertAnalyticalDashboard(definition);

            expect(result.tabs?.[0]?.parameters).toEqual([
                {
                    ref: tigerRef,
                    parameterType: "NUMBER",
                },
            ]);
        });

        it("emits no parameters field when no tab declares any", () => {
            const definition = makeDashboardDefinitionWithTabs([makeTab("tab-A")]);
            const result = convertAnalyticalDashboard(definition);
            expect(result.parameters).toBeUndefined();
            expect(result.tabs?.[0]?.parameters).toBeUndefined();
        });

        describe("enableAnalyticalDashboardVersion3 FF", () => {
            it("FF on with tabs: emits V3 — only tabs carry parameters, no root parameters field", () => {
                const definition = makeDashboardDefinitionWithTabs([
                    makeTab("tab-A", [
                        {
                            ref: idRef("topN", "parameter"),
                            parameterType: "NUMBER",
                            value: 25,
                            label: "Top N",
                            mode: "readonly",
                        },
                    ]),
                    makeTab("tab-B"),
                ]);

                const result = convertAnalyticalDashboard(definition, undefined, undefined, undefined, true);

                expect(result.version).toBe("3");
                expect(result.tabs?.[0]?.parameters).toEqual([
                    {
                        ref: tigerRef,
                        parameterType: "NUMBER",
                        value: 25,
                        label: "Top N",
                        mode: "readonly",
                    },
                ]);
            });

            it("FF on: V3 result has no root-level layout/configs/parameters at all", () => {
                // Simulates re-saving a dashboard that was previously read from backend
                // with root mirrored from tabs[0] — the V3 result must not carry any of them.
                const rootParameters: IDashboardParameter[] = [
                    {
                        ref: idRef("topN", "parameter"),
                        parameterType: "NUMBER",
                        value: 25,
                        mode: "active",
                    },
                ];
                const definition = {
                    ...makeDashboardDefinitionWithTabs([makeTab("tab-A", rootParameters), makeTab("tab-B")]),
                    parameters: rootParameters,
                    dateFilterConfig: { filterName: "root", mode: "readonly" } as never,
                } as IDashboardDefinition;

                const result = convertAnalyticalDashboard(definition, undefined, undefined, undefined, true);

                expect(result.version).toBe("3");
                expect("parameters" in result).toBe(false);
                expect("layout" in result).toBe(false);
                expect("dateFilterConfig" in result).toBe(false);
                expect("dateFilterConfigs" in result).toBe(false);
                expect("attributeFilterConfigs" in result).toBe(false);
                expect("measureValueFilterConfigs" in result).toBe(false);
                // Tabs are intact.
                expect(result.tabs?.[0]?.parameters).toHaveLength(1);
            });

            it("FF on with no tabs (legacy root-only) — falls back to V2, root content preserved", () => {
                const definition = {
                    type: "IDashboard",
                    title: "",
                    description: "",
                    shareStatus: "private",
                    parameters: [
                        {
                            ref: idRef("topN", "parameter"),
                            parameterType: "NUMBER",
                            value: 25,
                            mode: "active",
                        },
                    ],
                } as IDashboardDefinition;

                const result = convertAnalyticalDashboard(definition, undefined, undefined, undefined, true);

                expect(result.version).toBe("2");
                // narrow to V2 explicitly — runtime confirmed V2 above
                const v2 = result as AnalyticalDashboardModelV2.IAnalyticalDashboard;
                expect(v2.parameters).toEqual([
                    {
                        ref: tigerRef,
                        parameterType: "NUMBER",
                        value: 25,
                    },
                ]);
                expect(v2.tabs).toBeUndefined();
            });

            it("FF off (default): emits V2 and preserves existing tabs[0]-to-root mirroring", () => {
                const definition = makeDashboardDefinitionWithTabs([
                    makeTab("tab-A", [
                        {
                            ref: idRef("topN", "parameter"),
                            parameterType: "NUMBER",
                            value: 25,
                            mode: "active",
                        },
                    ]),
                ]);

                const resultDefault = convertAnalyticalDashboard(definition);
                const resultExplicitOff = convertAnalyticalDashboard(
                    definition,
                    undefined,
                    undefined,
                    undefined,
                    false,
                );

                expect(resultDefault.version).toBe("2");
                expect(resultExplicitOff.version).toBe("2");
                expect(resultDefault.parameters).toHaveLength(1);
                expect(resultExplicitOff.parameters).toHaveLength(1);
            });
        });
    });

    describe("round-trip", () => {
        it("preserves per-tab parameters across to->from converters", () => {
            const definition = makeDashboardDefinitionWithTabs([
                makeTab("tab-A", [
                    {
                        ref: idRef("topN", "parameter"),
                        parameterType: "NUMBER",
                        value: 25,
                        label: "Top N",
                        mode: "active",
                    },
                ]),
                makeTab("tab-B", [
                    {
                        ref: idRef("topN", "parameter"),
                        parameterType: "NUMBER",
                        mode: "active",
                    },
                ]),
            ]);

            const tigerContent = convertAnalyticalDashboard(definition);
            const dashboard = convertDashboard(makeDashboardDocument(tigerContent));

            expect(dashboard.tabs?.[0]?.parameters).toEqual(definition.tabs?.[0]?.parameters);
            expect(dashboard.tabs?.[1]?.parameters).toEqual(definition.tabs?.[1]?.parameters);
            // Root mirrors tabs[0] for V1 readers; on read-back, both root and tabs[0] are populated.
            expect(dashboard.parameters).toEqual(definition.tabs?.[0]?.parameters);
        });
    });
});
