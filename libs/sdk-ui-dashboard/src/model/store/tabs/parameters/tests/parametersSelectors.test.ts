// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboard,
    type IDashboardParameter,
    type IInsight,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    type IdentifierRef,
    type ObjRef,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { type RenderMode } from "../../../../../types.js";
import {
    type CatalogMeasureParametersStatus,
    type CatalogParametersStatus,
} from "../../../catalog/catalogState.js";
import { insightsAdapter } from "../../../insights/insightsEntityAdapter.js";
import { type DashboardState } from "../../../types.js";
import {
    selectActiveParameterRefKeys,
    selectDashboardParameterEntries,
    selectDashboardParameters,
    selectEffectiveParameterValuesForWidget,
    selectIsParametersChanged,
    selectParameterResetValueByRef,
    selectParameterRuntimeOverrideByRef,
    selectSmartPersistedTabsParameters,
} from "../parametersSelectors.js";
import { type IDashboardParameterEntry } from "../parametersState.js";

function makeInsightWithMetric(
    insightRef: ObjRef,
    metricRefOrRefs: ObjRef | ObjRef[],
    parameters: IInsightParameterValue[] = [],
): IInsight {
    const identifier = (insightRef as { identifier?: string }).identifier ?? "insight";
    const metricRefs = Array.isArray(metricRefOrRefs) ? metricRefOrRefs : [metricRefOrRefs];
    return {
        insight: {
            ref: insightRef,
            identifier,
            uri: `/insights/${identifier}`,
            title: identifier,
            visualizationUrl: "local:test",
            buckets: [
                {
                    items: metricRefs.map((metricRef, idx) => ({
                        measure: {
                            localIdentifier: metricRefs.length === 1 ? "metric" : `metric-${idx}`,
                            definition: { measureDefinition: { item: metricRef } },
                        },
                    })),
                },
            ],
            filters: [],
            sorts: [],
            properties: {},
            parameters,
        },
    } as unknown as IInsight;
}

function makeInsightsSliceState(insights: IInsight[]) {
    return insightsAdapter.setAll(insightsAdapter.getInitialState(), insights);
}

const BACKEND_CAPABILITIES: DashboardState["backendCapabilities"] = {
    backendCapabilities: {
        hasTypeScopedIdentifiers: false,
    } as DashboardState["backendCapabilities"]["backendCapabilities"],
};

const topNRef = idRef("topN", "parameter");
const otherRef = idRef("sampleSize", "parameter");

const topNParameter: IDashboardParameter = {
    ref: topNRef,
    parameterType: "NUMBER",
    mode: "active",
};

const topNWorkspace: IParameterMetadataObject = {
    type: "parameter",
    id: "topN",
    uri: "/topN",
    ref: topNRef,
    title: "Top N",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "NUMBER", defaultValue: 10 },
};

const entry: IDashboardParameterEntry = {
    parameter: topNParameter,
    runtimeOverride: 25,
};

function makeState(parameters: IDashboardParameterEntry[]): DashboardState {
    return {
        tabs: {
            tabs: [
                {
                    localIdentifier: "tab-1",
                    title: "Tab 1",
                    parameters: { parameters },
                },
            ],
            activeTabLocalIdentifier: "tab-1",
        },
    } as unknown as DashboardState;
}

interface IFullStateOptions {
    entries: IDashboardParameterEntry[];
    workspaceParameters?: IParameterMetadataObject[];
    catalogStatus?: CatalogParametersStatus;
    persistedDashboardParameters?: IDashboardParameter[];
    enableParameters?: boolean;
    insights?: IInsight[];
    renderMode?: RenderMode;
    measureParametersStatus?: CatalogMeasureParametersStatus;
    measureParameters?: Record<string, IdentifierRef[]>;
}

const TAB_ID = "tab-1";
const W1_REF = { identifier: "w-1", type: "insight" } as const;
const W1_INSIGHT_REF = idRef("insight-1", "insight");

function makeFullState({
    entries,
    workspaceParameters = [],
    catalogStatus = "loaded",
    persistedDashboardParameters,
    enableParameters = true,
    insights = [],
    renderMode = "view",
    measureParametersStatus = "loaded",
    measureParameters: byMetric = {},
}: IFullStateOptions): DashboardState {
    const persistedDashboard: Partial<IDashboard> | undefined =
        persistedDashboardParameters === undefined
            ? undefined
            : ({
                  parameters: persistedDashboardParameters,
                  tabs: [
                      {
                          localIdentifier: TAB_ID,
                          title: "Tab 1",
                          parameters: persistedDashboardParameters,
                      },
                  ],
              } as Partial<IDashboard>);
    return {
        tabs: {
            tabs: [
                {
                    localIdentifier: TAB_ID,
                    title: "Tab 1",
                    parameters: { parameters: entries },
                    layout: {
                        layout: {
                            type: "IDashboardLayout",
                            sections: [
                                {
                                    type: "IDashboardLayoutSection",
                                    items: [
                                        {
                                            type: "IDashboardLayoutItem",
                                            size: { xl: { gridWidth: 12 } },
                                            widget: {
                                                type: "insight",
                                                identifier: "w-1",
                                                ref: W1_REF,
                                                insight: W1_INSIGHT_REF,
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
            activeTabLocalIdentifier: TAB_ID,
        },
        insights: makeInsightsSliceState(insights),
        backendCapabilities: BACKEND_CAPABILITIES,
        catalog: {
            parameters: { status: catalogStatus, parameters: workspaceParameters },
            measureParameters: { status: measureParametersStatus, byMetric },
        },
        meta: { persistedDashboard },
        config: { config: { settings: { enableParameters } } },
        renderMode: { renderMode },
    } as unknown as DashboardState;
}

describe("parameter selectors (per tab)", () => {
    it("selectDashboardParameters returns persisted-shape entries from active tab", () => {
        expect(selectDashboardParameters(makeState([entry]))).toEqual([topNParameter]);
    });

    it("selectDashboardParameterEntries returns full entries from active tab", () => {
        expect(selectDashboardParameterEntries(makeState([entry]))).toEqual([entry]);
    });

    it("selectParameterRuntimeOverrideByRef returns runtimeOverride for matching ref", () => {
        const select = selectParameterRuntimeOverrideByRef(topNRef);
        expect(select(makeState([entry]))).toBe(25);
    });

    it("selectParameterRuntimeOverrideByRef returns undefined when ref absent", () => {
        const select = selectParameterRuntimeOverrideByRef(otherRef);
        expect(select(makeState([entry]))).toBeUndefined();
    });

    describe("selectParameterResetValueByRef", () => {
        it("view mode: returns parameter.value (dashboard override) when set", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                renderMode: "view",
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBe(50);
        });

        it("view mode: falls back to workspace default when parameter.value is undefined", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                renderMode: "view",
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBe(10);
        });

        it("edit mode: returns workspace default when parameter.value is set and differs from default", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                renderMode: "edit",
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBe(10);
        });

        it("edit mode: returns undefined when parameter.value is undefined (entry already inherits default)", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                renderMode: "edit",
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBeUndefined();
        });

        it("edit mode: returns undefined when parameter.value equals workspace default (unpin no-op)", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 10 }, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                renderMode: "edit",
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBeUndefined();
        });

        it("returns undefined when no entry exists on the active tab", () => {
            const state = makeFullState({
                entries: [],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBeUndefined();
        });

        it("returns undefined when workspace parameter is not loaded into the catalog", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }],
                workspaceParameters: [],
            });
            expect(selectParameterResetValueByRef(topNRef)(state)).toBeUndefined();
        });
    });

    describe("selectSmartPersistedTabsParameters", () => {
        it("omits value when runtimeOverride equals workspace default (per tab)", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 10 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({
                [TAB_ID]: [{ ref: topNRef, parameterType: "NUMBER", mode: "active" }],
            });
        });

        it("emits value when runtimeOverride differs from workspace default (per tab)", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({
                [TAB_ID]: [{ ref: topNRef, parameterType: "NUMBER", mode: "active", value: 25 }],
            });
        });

        it("omits label when equal to workspace title", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, label: "Top N" }, runtimeOverride: 10 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({
                [TAB_ID]: [{ ref: topNRef, parameterType: "NUMBER", mode: "active" }],
            });
        });

        it("preserves label when different from workspace title", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, label: "Custom Label" }, runtimeOverride: 10 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({
                [TAB_ID]: [{ ref: topNRef, parameterType: "NUMBER", mode: "active", label: "Custom Label" }],
            });
        });

        it("emits non-resolved entry verbatim from persisted when catalog status is not loaded", () => {
            const persisted: IDashboardParameter = {
                ref: topNRef,
                parameterType: "NUMBER",
                mode: "active",
                value: 99,
            };
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                catalogStatus: "gated-off",
                persistedDashboardParameters: [persisted],
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({ [TAB_ID]: [persisted] });
        });

        it("emits non-resolved entry verbatim when ref absent from loaded catalog", () => {
            const persisted: IDashboardParameter = {
                ref: topNRef,
                parameterType: "NUMBER",
                mode: "active",
                value: 99,
            };
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                workspaceParameters: [],
                persistedDashboardParameters: [persisted],
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({ [TAB_ID]: [persisted] });
        });

        it("falls back to live entry when non-resolved and no persisted entry on the same tab", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                catalogStatus: "gated-off",
            });
            expect(selectSmartPersistedTabsParameters(state)).toEqual({ [TAB_ID]: [topNParameter] });
        });
    });

    describe("selectIsParametersChanged", () => {
        it("is false when smart-persisted matches persisted", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 10 }],
                workspaceParameters: [topNWorkspace],
                persistedDashboardParameters: [{ ref: topNRef, parameterType: "NUMBER", mode: "active" }],
            });
            expect(selectIsParametersChanged(state)).toBe(false);
        });

        it("is true when runtimeOverride diverges from persisted value", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                persistedDashboardParameters: [{ ref: topNRef, parameterType: "NUMBER", mode: "active" }],
            });
            expect(selectIsParametersChanged(state)).toBe(true);
        });

        it("is true when entry added", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 10 }],
                workspaceParameters: [topNWorkspace],
                persistedDashboardParameters: [],
            });
            expect(selectIsParametersChanged(state)).toBe(true);
        });

        it("is false when no persisted dashboard and no entries", () => {
            const state = makeFullState({
                entries: [],
                workspaceParameters: [],
            });
            expect(selectIsParametersChanged(state)).toBe(false);
        });
    });

    describe("selectEffectiveParameterValuesForWidget", () => {
        const widgetRef = W1_REF;
        const sampleSizeRef = idRef("sampleSize", "parameter");
        const metricRef = idRef("m1", "measure");
        const insightWithTopN: IInsight = makeInsightWithMetric(W1_INSIGHT_REF, metricRef);
        const depMapTopN = { m1: [topNRef] };

        it("returns runtimeOverride when metric dependency map includes the parameter (insight.parameters empty)", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [insightWithTopN],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
        });

        it("returns nothing when the metric has no MAQL parameter references", () => {
            const insightWithLegacyParam = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 0 },
            ]);
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [insightWithLegacyParam],
                measureParameters: {},
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it("excludes dashboard parameters not referenced by the metric dependency map", () => {
            const sampleSize: IDashboardParameter = {
                ref: sampleSizeRef,
                parameterType: "NUMBER",
                mode: "active",
            };
            const state = makeFullState({
                entries: [
                    { parameter: topNParameter, runtimeOverride: 25 },
                    { parameter: sampleSize, runtimeOverride: 99 },
                ],
                insights: [insightWithTopN],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
        });

        it("returns identical reference when an unrelated parameter is added (defFingerprint stability)", () => {
            const stateWithoutUnrelated = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [insightWithTopN],
                measureParameters: depMapTopN,
            });
            const sampleSize: IDashboardParameter = {
                ref: sampleSizeRef,
                parameterType: "NUMBER",
                mode: "active",
            };
            const stateWithUnrelated = makeFullState({
                entries: [
                    { parameter: topNParameter, runtimeOverride: 25 },
                    { parameter: sampleSize, runtimeOverride: 99 },
                ],
                insights: [insightWithTopN],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(stateWithoutUnrelated)).toEqual(
                selectEffectiveParameterValuesForWidget(widgetRef)(stateWithUnrelated),
            );
        });

        it("unions parameter refs from every metric on a multi-measure insight", () => {
            const m1 = idRef("m1", "measure");
            const m2 = idRef("m2", "measure");
            const multiMeasureInsight: IInsight = {
                insight: {
                    ref: W1_INSIGHT_REF,
                    identifier: "insight-1",
                    uri: "/insights/insight-1",
                    title: "insight-1",
                    visualizationUrl: "local:test",
                    buckets: [
                        {
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "a",
                                        definition: { measureDefinition: { item: m1 } },
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "b",
                                        definition: { measureDefinition: { item: m2 } },
                                    },
                                },
                            ],
                        },
                    ],
                    filters: [],
                    sorts: [],
                    properties: {},
                },
            } as unknown as IInsight;
            const sampleSize: IDashboardParameter = {
                ref: sampleSizeRef,
                parameterType: "NUMBER",
                mode: "active",
            };
            const state = makeFullState({
                entries: [
                    { parameter: topNParameter, runtimeOverride: 25 },
                    { parameter: sampleSize, runtimeOverride: 99 },
                ],
                insights: [multiMeasureInsight],
                measureParameters: { m1: [topNRef], m2: [sampleSizeRef] },
            });
            const result = selectEffectiveParameterValuesForWidget(widgetRef)(state);
            expect(result).toEqual(
                expect.arrayContaining([
                    { ref: topNRef, value: 25 },
                    { ref: sampleSizeRef, value: 99 },
                ]),
            );
            expect(result).toHaveLength(2);
        });

        it("applies sibling simple-measure deps even when the insight also has an arithmetic measure", () => {
            const m1 = idRef("m1", "measure");
            const arithAndSimpleInsight: IInsight = {
                insight: {
                    ref: W1_INSIGHT_REF,
                    identifier: "insight-1",
                    uri: "/insights/insight-1",
                    title: "insight-1",
                    visualizationUrl: "local:test",
                    buckets: [
                        {
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "arith",
                                        definition: {
                                            arithmeticMeasure: {
                                                measureIdentifiers: ["a"],
                                                operator: "sum",
                                            },
                                        },
                                    },
                                },
                                {
                                    measure: {
                                        localIdentifier: "simple",
                                        definition: { measureDefinition: { item: m1 } },
                                    },
                                },
                            ],
                        },
                    ],
                    filters: [],
                    sorts: [],
                    properties: {},
                },
            } as unknown as IInsight;
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [arithAndSimpleInsight],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
        });

        it("ignores inline / PoP / arithmetic measures without crashing (no dep contribution)", () => {
            const popOnlyInsight: IInsight = {
                insight: {
                    ref: W1_INSIGHT_REF,
                    identifier: "insight-1",
                    uri: "/insights/insight-1",
                    title: "insight-1",
                    visualizationUrl: "local:test",
                    buckets: [
                        {
                            items: [
                                {
                                    measure: {
                                        localIdentifier: "pop",
                                        definition: {
                                            popMeasureDefinition: {
                                                measureIdentifier: "x",
                                                popAttribute: idRef("attr-x", "attribute"),
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                    filters: [],
                    sorts: [],
                    properties: {},
                },
            } as unknown as IInsight;
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [popOnlyInsight],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it("returns empty array when widget has no insight", () => {
            const missingRef = idRef("missing", "insight");
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(missingRef)(state)).toEqual([]);
        });

        it("returns empty array when enableParameters is off", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                enableParameters: false,
                insights: [insightWithTopN],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it("returns empty array when measure-parameter status is uninitialized", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [insightWithTopN],
                measureParameters: depMapTopN,
                measureParametersStatus: "uninitialized",
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it("returns empty array when measure-parameter status is failed", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [insightWithTopN],
                measureParameters: {},
                measureParametersStatus: "failed",
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it("falls back to insight.parameters when no dashboard entry claims the parameter", () => {
            const insightWithFallback = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
            ]);
            const state = makeFullState({
                entries: [],
                insights: [insightWithFallback],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 5 },
            ]);
        });

        it("returns equal results when insight.parameters contains an unrelated ref (defFingerprint stability)", () => {
            const insightWithOnlyRelevantParam = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
            ]);
            const insightWithUnrelatedExtra = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
                { ref: sampleSizeRef, value: 99 },
            ]);
            const stateWithoutUnrelated = makeFullState({
                entries: [],
                insights: [insightWithOnlyRelevantParam],
                measureParameters: depMapTopN,
            });
            const stateWithUnrelated = makeFullState({
                entries: [],
                insights: [insightWithUnrelatedExtra],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(stateWithoutUnrelated)).toEqual(
                selectEffectiveParameterValuesForWidget(widgetRef)(stateWithUnrelated),
            );
        });

        it("insight chain is gated by enableParameters", () => {
            const insightWithFallback = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
            ]);
            const state = makeFullState({
                entries: [],
                enableParameters: false,
                insights: [insightWithFallback],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it.each(["uninitialized", "loading", "failed"] as const)(
            "insight chain is gated by measure-parameter status (%s)",
            (status) => {
                const insightWithFallback = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                    { ref: topNRef, value: 5 },
                ]);
                const state = makeFullState({
                    entries: [],
                    insights: [insightWithFallback],
                    measureParameters: depMapTopN,
                    measureParametersStatus: status,
                });
                expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
            },
        );

        it("mixes dashboard runtimeOverride and insight.parameters across measures of one insight", () => {
            const m1 = idRef("m1", "measure");
            const m2 = idRef("m2", "measure");
            const multiMeasureInsight = makeInsightWithMetric(
                W1_INSIGHT_REF,
                [m1, m2],
                [{ ref: sampleSizeRef, value: 50 }],
            );
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [multiMeasureInsight],
                measureParameters: { m1: [topNRef], m2: [sampleSizeRef] },
            });
            const result = selectEffectiveParameterValuesForWidget(widgetRef)(state);
            expect(result).toEqual(
                expect.arrayContaining([
                    { ref: topNRef, value: 25 },
                    { ref: sampleSizeRef, value: 50 },
                ]),
            );
            expect(result).toHaveLength(2);
        });

        it("filters stale insight.parameters refs not present in the dependency map", () => {
            const insightWithStaleParam = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
            ]);
            const state = makeFullState({
                entries: [],
                insights: [insightWithStaleParam],
                measureParameters: { m1: [] },
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });

        it("falls through to insight.parameters when dashboard entry has no runtimeOverride", () => {
            const insightWithFallback = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
            ]);
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: undefined }],
                insights: [insightWithFallback],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 5 },
            ]);
        });

        it("dashboard runtimeOverride wins over insight.parameters when both are present", () => {
            const insightWithFallback = makeInsightWithMetric(W1_INSIGHT_REF, metricRef, [
                { ref: topNRef, value: 5 },
            ]);
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                insights: [insightWithFallback],
                measureParameters: depMapTopN,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
        });

        it("resolves the owning tab for an insight nested in a visualization switcher", () => {
            const switcherChildRef = idRef("switcher-child", "insight");
            const switcherChildInsightRef = idRef("switcher-child-insight", "insight");
            const state = {
                tabs: {
                    tabs: [
                        {
                            localIdentifier: TAB_ID,
                            title: "Tab 1",
                            parameters: {
                                parameters: [{ parameter: topNParameter, runtimeOverride: 42 }],
                            },
                            layout: {
                                layout: {
                                    type: "IDashboardLayout",
                                    sections: [
                                        {
                                            type: "IDashboardLayoutSection",
                                            items: [
                                                {
                                                    type: "IDashboardLayoutItem",
                                                    size: { xl: { gridWidth: 12 } },
                                                    widget: {
                                                        type: "visualizationSwitcher",
                                                        identifier: "switcher-1",
                                                        ref: { identifier: "switcher-1", type: "insight" },
                                                        visualizations: [
                                                            {
                                                                type: "insight",
                                                                identifier: "switcher-child",
                                                                ref: switcherChildRef,
                                                                insight: switcherChildInsightRef,
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    activeTabLocalIdentifier: TAB_ID,
                },
                insights: makeInsightsSliceState([
                    makeInsightWithMetric(switcherChildInsightRef, idRef("metric-switcher", "measure")),
                ]),
                backendCapabilities: BACKEND_CAPABILITIES,
                catalog: {
                    parameters: { status: "loaded", parameters: [] },
                    measureParameters: {
                        status: "loaded",
                        byMetric: { "metric-switcher": [topNRef] },
                    },
                },
                meta: { persistedDashboard: undefined },
                config: { config: { settings: { enableParameters: true } } },
            } as unknown as DashboardState;

            expect(selectEffectiveParameterValuesForWidget(switcherChildRef)(state)).toEqual([
                { ref: topNRef, value: 42 },
            ]);
        });
    });

    describe("per-tab independence (acceptance tests)", () => {
        const widgetA = { identifier: "w-A", type: "insight" } as const;
        const widgetB = { identifier: "w-B", type: "insight" } as const;
        const insightARef = idRef("insight-A", "insight");
        const insightBRef = idRef("insight-B", "insight");
        const insightAWithTopN = makeInsightWithMetric(insightARef, idRef("metric-A", "measure"), [
            { ref: topNRef, value: 0 },
        ]);
        const insightBWithTopN = makeInsightWithMetric(insightBRef, idRef("metric-B", "measure"), [
            { ref: topNRef, value: 0 },
        ]);

        function makeTwoTabState({
            tabAEntries,
            tabBEntries,
            workspaceParameters = [topNWorkspace],
            enableParameters = true,
            insights = [],
        }: {
            tabAEntries: IDashboardParameterEntry[];
            tabBEntries: IDashboardParameterEntry[];
            workspaceParameters?: IParameterMetadataObject[];
            enableParameters?: boolean;
            insights?: IInsight[];
        }): DashboardState {
            return {
                tabs: {
                    tabs: [
                        {
                            localIdentifier: "tab-A",
                            title: "Tab A",
                            parameters: { parameters: tabAEntries },
                            layout: {
                                layout: {
                                    type: "IDashboardLayout",
                                    sections: [
                                        {
                                            type: "IDashboardLayoutSection",
                                            items: [
                                                {
                                                    type: "IDashboardLayoutItem",
                                                    size: { xl: { gridWidth: 12 } },
                                                    widget: {
                                                        type: "insight",
                                                        identifier: "w-A",
                                                        ref: widgetA,
                                                        insight: insightARef,
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            localIdentifier: "tab-B",
                            title: "Tab B",
                            parameters: { parameters: tabBEntries },
                            layout: {
                                layout: {
                                    type: "IDashboardLayout",
                                    sections: [
                                        {
                                            type: "IDashboardLayoutSection",
                                            items: [
                                                {
                                                    type: "IDashboardLayoutItem",
                                                    size: { xl: { gridWidth: 12 } },
                                                    widget: {
                                                        type: "insight",
                                                        identifier: "w-B",
                                                        ref: widgetB,
                                                        insight: insightBRef,
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    activeTabLocalIdentifier: "tab-A",
                },
                insights: makeInsightsSliceState(insights),
                backendCapabilities: BACKEND_CAPABILITIES,
                catalog: {
                    parameters: { status: "loaded", parameters: workspaceParameters },
                    measureParameters: {
                        status: "loaded",
                        byMetric: {
                            "metric-A": [topNRef],
                            "metric-B": [topNRef],
                        },
                    },
                },
                meta: { persistedDashboard: undefined },
                config: { config: { settings: { enableParameters } } },
            } as unknown as DashboardState;
        }

        it("per-tab widget execution — widget on tab A consumes tab A's runtime, widget on tab B falls back to insight", () => {
            // Both widgets reference param topN via insight, but only tab A has it added.
            // Tab B has no dashboard entry → widget B falls back to its insight.parameters value.
            const state = makeTwoTabState({
                tabAEntries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                tabBEntries: [],
                insights: [insightAWithTopN, insightBWithTopN],
            });

            expect(selectEffectiveParameterValuesForWidget(widgetA)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
            expect(selectEffectiveParameterValuesForWidget(widgetB)(state)).toEqual([
                { ref: topNRef, value: 0 },
            ]);
        });

        it("widgets on different tabs see their own tab's runtimeOverride", () => {
            const state = makeTwoTabState({
                tabAEntries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                tabBEntries: [{ parameter: topNParameter, runtimeOverride: 99 }],
                insights: [insightAWithTopN, insightBWithTopN],
            });

            expect(selectEffectiveParameterValuesForWidget(widgetA)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
            expect(selectEffectiveParameterValuesForWidget(widgetB)(state)).toEqual([
                { ref: topNRef, value: 99 },
            ]);
        });

        it("resolves insight for a widget on a non-active tab (cross-tab insight lookup)", () => {
            // Regression: widget B lives on tab B (not active). With active-only insight resolution,
            // the selector would return [] regardless of tab B's runtimeOverride. Cross-tab lookup
            // must return the override defined on tab B.
            const state = makeTwoTabState({
                tabAEntries: [],
                tabBEntries: [{ parameter: topNParameter, runtimeOverride: 77 }],
                insights: [insightAWithTopN, insightBWithTopN],
            });

            expect(selectEffectiveParameterValuesForWidget(widgetB)(state)).toEqual([
                { ref: topNRef, value: 77 },
            ]);
        });

        it("per-tab picker deduplication — active tab dedup ignores other tabs", () => {
            // selectActiveParameterRefKeys reflects only the active tab's parameters.
            const stateActiveOnA = makeTwoTabState({
                tabAEntries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                tabBEntries: [],
            });
            const tabAKeys = selectActiveParameterRefKeys(stateActiveOnA);
            expect(tabAKeys.has(objRefToString(topNRef))).toBe(true);

            // Switching active tab — same selector now returns tab B's keys (empty).
            const stateActiveOnB: DashboardState = {
                ...stateActiveOnA,
                tabs: {
                    ...(stateActiveOnA.tabs as unknown as Record<string, unknown>),
                    activeTabLocalIdentifier: "tab-B",
                },
            } as unknown as DashboardState;
            const tabBKeys = selectActiveParameterRefKeys(stateActiveOnB);
            expect(tabBKeys.has(objRefToString(topNRef))).toBe(false);
        });
    });
});
