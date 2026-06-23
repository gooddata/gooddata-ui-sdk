// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboard,
    type IDashboardParameter,
    type IInsight,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    type IdentifierRef,
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
import { computeParameterResetTargets } from "../parametersHelpers.js";
import {
    selectActiveParameterRefKeys,
    selectActiveTabExportParameters,
    selectDashboardParameterEntries,
    selectDashboardParameters,
    selectEffectiveDashboardParametersForWidget,
    selectEffectiveParameterValuesForWidget,
    selectExportEffectiveParameters,
    selectFilterViewParameters,
    selectHasAnyResettableParameterOnActiveTab,
    selectIsParametersChanged,
    selectParameterResetValueByRef,
    selectParameterRuntimeOverrideByRef,
    selectSmartPersistedTabsParameters,
} from "../parametersSelectors.js";
import { type IDashboardParameterEntry } from "../parametersState.js";

function makeInsightWithMetric(
    insightRef: IdentifierRef,
    metricRefOrRefs: IdentifierRef | IdentifierRef[],
    parameters: IInsightParameterValue[] = [],
): IInsight {
    const identifier = insightRef.identifier;
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
    };
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

    describe("selectFilterViewParameters", () => {
        it("returns undefined when there are no parameter entries", () => {
            expect(selectFilterViewParameters(makeState([]))).toBeUndefined();
        });

        it("writes runtime overrides into values", () => {
            expect(
                selectFilterViewParameters(makeState([{ parameter: topNParameter, runtimeOverride: 42 }])),
            ).toEqual([{ ...topNParameter, value: 42 }]);
        });

        it("preserves existing value when runtime override is undefined", () => {
            const withValue: IDashboardParameter = { ...topNParameter, value: 25 };

            expect(
                selectFilterViewParameters(makeState([{ parameter: withValue, runtimeOverride: undefined }])),
            ).toEqual([withValue]);
        });

        it("preserves multi-parameter ordering and per-entry runtime values", () => {
            const sampleSize: IDashboardParameter = {
                ref: otherRef,
                parameterType: "NUMBER",
                mode: "active",
            };

            expect(
                selectFilterViewParameters(
                    makeState([
                        { parameter: topNParameter, runtimeOverride: 10 },
                        { parameter: sampleSize, runtimeOverride: 200 },
                    ]),
                ),
            ).toEqual([
                { ...topNParameter, value: 10 },
                { ...sampleSize, value: 200 },
            ]);
        });
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

    describe("selectHasAnyResettableParameterOnActiveTab", () => {
        it("returns true when a parameter's runtimeOverride differs from its reset value", () => {
            // view mode, parameter.value=50, runtimeOverride=99 → reset target=50, 99≠50 ⇒ resettable
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectHasAnyResettableParameterOnActiveTab(state)).toBe(true);
        });

        it("returns false when enableParameters is off, even with otherwise-resettable params", () => {
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }],
                workspaceParameters: [topNWorkspace],
                enableParameters: false,
            });
            expect(selectHasAnyResettableParameterOnActiveTab(state)).toBe(false);
        });

        it("returns false when every parameter's runtimeOverride already equals its reset value", () => {
            // view mode, parameter.value=50, runtimeOverride=50 → reset target=50, equal ⇒ no-op
            const state = makeFullState({
                entries: [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 50 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectHasAnyResettableParameterOnActiveTab(state)).toBe(false);
        });

        it("returns false when active tab has no parameter entries", () => {
            const state = makeFullState({ entries: [], workspaceParameters: [topNWorkspace] });
            expect(selectHasAnyResettableParameterOnActiveTab(state)).toBe(false);
        });
    });

    describe("computeParameterResetTargets", () => {
        it("returns one payload entry per resettable parameter with the computed reset value", () => {
            // view mode: parameter.value=50 ⇒ reset target=50; runtimeOverride=99 (differs)
            const entries = [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }];
            expect(computeParameterResetTargets(entries, [topNWorkspace], false)).toEqual([
                { ref: topNRef, value: 50 },
            ]);
        });

        it("skips entries already at their reset value", () => {
            // view mode: parameter.value=50 ⇒ reset target=50; runtimeOverride=50 (equal, no-op)
            const entries = [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 50 }];
            expect(computeParameterResetTargets(entries, [topNWorkspace], false)).toEqual([]);
        });

        it("skips entries where workspace parameter is unresolved", () => {
            // No workspace catalog entry ⇒ reset value undefined ⇒ skip
            const entries = [{ parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }];
            expect(computeParameterResetTargets(entries, [], false)).toEqual([]);
        });

        it("includes only the resettable subset when some entries are no-ops", () => {
            const sampleSize: IDashboardParameter = {
                ref: otherRef,
                parameterType: "NUMBER",
                mode: "active",
            };
            const sampleWorkspace: IParameterMetadataObject = {
                ...topNWorkspace,
                id: "sampleSize",
                uri: "/sampleSize",
                ref: otherRef,
                title: "Sample Size",
                definition: { type: "NUMBER", defaultValue: 200 },
            };
            const entries = [
                { parameter: { ...topNParameter, value: 50 }, runtimeOverride: 99 }, // resettable
                { parameter: { ...sampleSize, value: 200 }, runtimeOverride: 200 }, // at reset value
            ];
            expect(computeParameterResetTargets(entries, [topNWorkspace, sampleWorkspace], false)).toEqual([
                { ref: topNRef, value: 50 },
            ]);
        });

        it("skips HIDDEN parameters even when otherwise resettable", () => {
            const entries = [
                { parameter: { ...topNParameter, mode: "hidden", value: 50 }, runtimeOverride: 99 },
            ] satisfies IDashboardParameterEntry[];
            expect(computeParameterResetTargets(entries, [topNWorkspace], false)).toEqual([]);
        });

        it("skips READONLY parameters even when otherwise resettable", () => {
            const entries = [
                { parameter: { ...topNParameter, mode: "readonly", value: 50 }, runtimeOverride: 99 },
            ] satisfies IDashboardParameterEntry[];
            expect(computeParameterResetTargets(entries, [topNWorkspace], false)).toEqual([]);
        });

        it("skips entries whose runtimeOverride is undefined (chip hidden, no execution change)", () => {
            // overrideDefaultParameters / hydration can leave runtimeOverride === undefined; chip is
            // then hidden and execution falls back to insight.parameters. Reset must not flip that.
            const entries = [
                { parameter: { ...topNParameter, value: 50 }, runtimeOverride: undefined },
            ] satisfies IDashboardParameterEntry[];
            expect(computeParameterResetTargets(entries, [topNWorkspace], false)).toEqual([]);
        });
    });

    describe("selectHasAnyResettableParameterOnActiveTab — mode gating", () => {
        it("returns false when the only resettable entry is HIDDEN", () => {
            const state = makeFullState({
                entries: [
                    { parameter: { ...topNParameter, mode: "hidden", value: 50 }, runtimeOverride: 99 },
                ],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectHasAnyResettableParameterOnActiveTab(state)).toBe(false);
        });

        it("returns false when the only resettable entry is READONLY", () => {
            const state = makeFullState({
                entries: [
                    { parameter: { ...topNParameter, mode: "readonly", value: 50 }, runtimeOverride: 99 },
                ],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectHasAnyResettableParameterOnActiveTab(state)).toBe(false);
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

        it("selectEffectiveDashboardParametersForWidget resolves the widget's owning tab with runtimeOverride folded in", () => {
            // Widget B lives on (inactive) tab B; its entry must win over the active tab A's entry.
            const state = makeTwoTabState({
                tabAEntries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                tabBEntries: [
                    { parameter: { ...topNParameter, mode: "readonly", value: 5 }, runtimeOverride: 99 },
                ],
            });

            expect(selectEffectiveDashboardParametersForWidget(widgetB)(state)).toEqual([
                { ...topNParameter, mode: "readonly", value: 99 },
            ]);
        });

        it("selectEffectiveDashboardParametersForWidget keeps the persisted value when the owning tab has no runtimeOverride", () => {
            const state = makeTwoTabState({
                tabAEntries: [],
                tabBEntries: [{ parameter: { ...topNParameter, value: 5 }, runtimeOverride: undefined }],
            });

            expect(selectEffectiveDashboardParametersForWidget(widgetB)(state)).toEqual([
                { ...topNParameter, value: 5 },
            ]);
        });

        it("selectEffectiveDashboardParametersForWidget falls back to the active tab when no ref is given", () => {
            const state = makeTwoTabState({
                tabAEntries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                tabBEntries: [{ parameter: topNParameter, runtimeOverride: 99 }],
            });

            expect(selectEffectiveDashboardParametersForWidget(undefined)(state)).toEqual([
                { ...topNParameter, value: 25 },
            ]);
        });

        it("selectEffectiveDashboardParametersForWidget returns no parameters for a widget not on the dashboard", () => {
            // The active tab is unrelated to the unknown widget — its entries must not leak in.
            const state = makeTwoTabState({
                tabAEntries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                tabBEntries: [{ parameter: topNParameter, runtimeOverride: 99 }],
            });

            expect(selectEffectiveDashboardParametersForWidget(idRef("w-unknown", "insight"))(state)).toEqual(
                [],
            );
        });
    });

    describe("selectExportEffectiveParameters", () => {
        const exportSampleSizeRef = idRef("sampleSize", "parameter");
        const exportSampleSizeWorkspace: IParameterMetadataObject = {
            ...topNWorkspace,
            id: "sampleSize",
            uri: "/sampleSize",
            ref: exportSampleSizeRef,
            title: "Sample Size",
        };
        const insightWithTopN = makeInsightWithMetric(W1_INSIGHT_REF, idRef("metric-A", "measure"));
        const depMapTopN: Record<string, IdentifierRef[]> = { "metric-A": [topNRef] };

        describe("dashboard scope (widgetIds empty/undefined)", () => {
            it("emits map keyed by tab.localIdentifier with formatted rows", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    insights: [insightWithTopN],
                    measureParameters: depMapTopN,
                });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({
                    [TAB_ID]: [{ id: "topN", value: "25", title: "Top N" }],
                });
            });

            it("includes HIDDEN-mode entries because mode only controls chip visibility", () => {
                const hiddenParam: IDashboardParameter = {
                    ref: exportSampleSizeRef,
                    parameterType: "NUMBER",
                    mode: "hidden",
                };
                const state = makeFullState({
                    entries: [
                        { parameter: topNParameter, runtimeOverride: 25 },
                        { parameter: hiddenParam, runtimeOverride: 99 },
                    ],
                    workspaceParameters: [topNWorkspace, exportSampleSizeWorkspace],
                });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({
                    [TAB_ID]: [
                        { id: "topN", value: "25", title: "Top N" },
                        { id: "sampleSize", value: "99", title: "Sample Size" },
                    ],
                });
            });

            it("emits HIDDEN-mode entries when they have runtimeOverride", () => {
                const hiddenParam: IDashboardParameter = {
                    ref: exportSampleSizeRef,
                    parameterType: "NUMBER",
                    mode: "hidden",
                };
                const state = makeFullState({
                    entries: [{ parameter: hiddenParam, runtimeOverride: 99 }],
                    workspaceParameters: [exportSampleSizeWorkspace],
                });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({
                    [TAB_ID]: [{ id: "sampleSize", value: "99", title: "Sample Size" }],
                });
            });

            it("returns {} when no tab has any entry at all", () => {
                const state = makeFullState({ entries: [] });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({});
            });

            it("skips entries without runtimeOverride so the backend keeps its own resolution", () => {
                const state = makeFullState({
                    entries: [
                        { parameter: topNParameter, runtimeOverride: undefined },
                        { parameter: { ...topNParameter, value: 50 }, runtimeOverride: undefined },
                    ],
                    workspaceParameters: [topNWorkspace],
                });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({});
            });

            it("treats widgetIds=[] as dashboard scope (whole-dashboard export)", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                });
                expect(selectExportEffectiveParameters([])(state)).toEqual({
                    [TAB_ID]: [{ id: "topN", value: "25", title: "Top N" }],
                });
            });

            it("V1 root-fallback collapses to one synthetic tab entry under the loaded tab id", () => {
                // V1 reducers populate the synthetic single tab's parameters from the root array;
                // the selector reads `tab.parameters` directly so the test fixture mimics that
                // post-population state. The map carries exactly one entry, keyed by that tab id.
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 7 }],
                    workspaceParameters: [topNWorkspace],
                });
                const result = selectExportEffectiveParameters(undefined)(state);
                expect(Object.keys(result)).toEqual([TAB_ID]);
                expect(result[TAB_ID]).toEqual([{ id: "topN", value: "7", title: "Top N" }]);
            });
        });

        describe("widget scope (widgetIds non-empty)", () => {
            it("intersects with widget's metric-referenced refs, keyed by owning tabId", () => {
                const sampleSizeParam: IDashboardParameter = {
                    ref: exportSampleSizeRef,
                    parameterType: "NUMBER",
                    mode: "active",
                };
                const state = makeFullState({
                    entries: [
                        { parameter: topNParameter, runtimeOverride: 25 },
                        { parameter: sampleSizeParam, runtimeOverride: 99 },
                    ],
                    workspaceParameters: [topNWorkspace, exportSampleSizeWorkspace],
                    insights: [insightWithTopN],
                    measureParameters: depMapTopN,
                });
                // Insight references only topN, so sampleSize is excluded.
                expect(selectExportEffectiveParameters(["w-1"])(state)).toEqual({
                    [TAB_ID]: [{ id: "topN", value: "25", title: "Top N" }],
                });
            });

            it("omits owning tab when widget references no parameters", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    insights: [insightWithTopN],
                    measureParameters: {}, // no parameter dep for any metric
                });
                expect(selectExportEffectiveParameters(["w-1"])(state)).toEqual({});
            });

            it("returns {} when the requested widgetId is not found in the layout", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    insights: [insightWithTopN],
                    measureParameters: depMapTopN,
                });
                expect(selectExportEffectiveParameters(["does-not-exist"])(state)).toEqual({});
            });

            it("returns {} when the insight referenced by the widget is missing", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    insights: [], // widget points at W1_INSIGHT_REF which is absent
                    measureParameters: depMapTopN,
                });
                expect(selectExportEffectiveParameters(["w-1"])(state)).toEqual({});
            });

            it("widget on non-active tab → key = owning tabId, not active tabId", () => {
                const widgetA = { identifier: "w-A", type: "insight" } as const;
                const widgetB = { identifier: "w-B", type: "insight" } as const;
                const insightARef = idRef("insight-A", "insight");
                const insightBRef = idRef("insight-B", "insight");
                const insightA = makeInsightWithMetric(insightARef, idRef("metric-A", "measure"));
                const insightB = makeInsightWithMetric(insightBRef, idRef("metric-B", "measure"));
                const state = {
                    tabs: {
                        tabs: [
                            {
                                localIdentifier: "tab-A",
                                title: "Tab A",
                                parameters: {
                                    parameters: [{ parameter: topNParameter, runtimeOverride: 10 }],
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
                                parameters: {
                                    parameters: [{ parameter: topNParameter, runtimeOverride: 99 }],
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
                    insights: makeInsightsSliceState([insightA, insightB]),
                    backendCapabilities: BACKEND_CAPABILITIES,
                    catalog: {
                        parameters: { status: "loaded", parameters: [topNWorkspace] },
                        measureParameters: {
                            status: "loaded",
                            byMetric: {
                                "metric-A": [topNRef],
                                "metric-B": [topNRef],
                            },
                        },
                    },
                    meta: { persistedDashboard: undefined },
                    config: { config: { settings: { enableParameters: true } } },
                } as unknown as DashboardState;

                // Exporting widget B from active tab A → result must key on tab B (B's owning tab).
                expect(selectExportEffectiveParameters(["w-B"])(state)).toEqual({
                    "tab-B": [{ id: "topN", value: "99", title: "Top N" }],
                });
            });

            it("multi-widget on the same tab → unions referenced refs, keyed by that one tab", () => {
                const m1 = idRef("m1", "measure");
                const m2 = idRef("m2", "measure");
                const insightM1 = makeInsightWithMetric(W1_INSIGHT_REF, m1);
                const widgetTwoRef = { identifier: "w-2", type: "insight" } as const;
                const insightW2Ref = idRef("insight-2", "insight");
                const insightM2 = makeInsightWithMetric(insightW2Ref, m2);
                const sampleSizeParam: IDashboardParameter = {
                    ref: exportSampleSizeRef,
                    parameterType: "NUMBER",
                    mode: "active",
                };
                const state = {
                    tabs: {
                        tabs: [
                            {
                                localIdentifier: TAB_ID,
                                title: "Tab 1",
                                parameters: {
                                    parameters: [
                                        { parameter: topNParameter, runtimeOverride: 25 },
                                        { parameter: sampleSizeParam, runtimeOverride: 99 },
                                    ],
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
                                                            type: "insight",
                                                            identifier: "w-1",
                                                            ref: W1_REF,
                                                            insight: W1_INSIGHT_REF,
                                                        },
                                                    },
                                                    {
                                                        type: "IDashboardLayoutItem",
                                                        size: { xl: { gridWidth: 12 } },
                                                        widget: {
                                                            type: "insight",
                                                            identifier: "w-2",
                                                            ref: widgetTwoRef,
                                                            insight: insightW2Ref,
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
                    insights: makeInsightsSliceState([insightM1, insightM2]),
                    backendCapabilities: BACKEND_CAPABILITIES,
                    catalog: {
                        parameters: {
                            status: "loaded",
                            parameters: [topNWorkspace, exportSampleSizeWorkspace],
                        },
                        measureParameters: {
                            status: "loaded",
                            byMetric: { m1: [topNRef], m2: [exportSampleSizeRef] },
                        },
                    },
                    meta: { persistedDashboard: undefined },
                    config: { config: { settings: { enableParameters: true } } },
                } as unknown as DashboardState;

                expect(selectExportEffectiveParameters(["w-1", "w-2"])(state)).toEqual({
                    [TAB_ID]: [
                        { id: "topN", value: "25", title: "Top N" },
                        { id: "sampleSize", value: "99", title: "Sample Size" },
                    ],
                });
            });
        });

        describe("gating", () => {
            it("returns {} when enableParameters is off (dashboard scope)", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    enableParameters: false,
                });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({});
            });

            it("returns {} when enableParameters is off (widget scope)", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    enableParameters: false,
                    insights: [insightWithTopN],
                    measureParameters: depMapTopN,
                });
                expect(selectExportEffectiveParameters(["w-1"])(state)).toEqual({});
            });

            it.each(["uninitialized", "loading", "failed"] as const)(
                "returns {} when catalog parameters status is %s",
                (status) => {
                    const state = makeFullState({
                        entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                        workspaceParameters: [topNWorkspace],
                        catalogStatus: status,
                    });
                    expect(selectExportEffectiveParameters(undefined)(state)).toEqual({});
                },
            );

            it.each(["uninitialized", "loading", "failed"] as const)(
                "returns {} on widget scope when measure-parameter status is %s",
                (status) => {
                    const state = makeFullState({
                        entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                        workspaceParameters: [topNWorkspace],
                        insights: [insightWithTopN],
                        measureParameters: depMapTopN,
                        measureParametersStatus: status,
                    });
                    expect(selectExportEffectiveParameters(["w-1"])(state)).toEqual({});
                },
            );

            it("dashboard scope ignores measure-parameter status (not required for whole-dashboard)", () => {
                const state = makeFullState({
                    entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                    workspaceParameters: [topNWorkspace],
                    measureParametersStatus: "uninitialized",
                });
                expect(selectExportEffectiveParameters(undefined)(state)).toEqual({
                    [TAB_ID]: [{ id: "topN", value: "25", title: "Top N" }],
                });
            });
        });
    });

    describe("selectActiveTabExportParameters", () => {
        const makeTwoTabState = (activeTabLocalIdentifier: string | undefined, firstTabId: string) =>
            ({
                tabs: {
                    tabs: [
                        {
                            localIdentifier: firstTabId,
                            title: "First",
                            parameters: { parameters: [{ parameter: topNParameter, runtimeOverride: 10 }] },
                        },
                        {
                            localIdentifier: "tab-B",
                            title: "Second",
                            parameters: { parameters: [{ parameter: topNParameter, runtimeOverride: 99 }] },
                        },
                    ],
                    activeTabLocalIdentifier,
                },
                catalog: { parameters: { status: "loaded", parameters: [topNWorkspace] } },
                meta: { persistedDashboard: undefined },
                config: { config: { settings: { enableParameters: true } } },
            }) as unknown as DashboardState;

        it("returns only the active tab's rows", () => {
            expect(selectActiveTabExportParameters(makeTwoTabState("tab-B", "tab-A"))).toEqual([
                { id: "topN", value: "99", title: "Top N" },
            ]);
        });

        it("scopes to the active tab, not other tabs", () => {
            expect(selectActiveTabExportParameters(makeTwoTabState("tab-A", "tab-A"))).toEqual([
                { id: "topN", value: "10", title: "Top N" },
            ]);
        });

        it("falls back to the default tab id when no active tab is set", () => {
            expect(selectActiveTabExportParameters(makeTwoTabState(undefined, "tab-A"))).toEqual([]);
        });
    });
});
