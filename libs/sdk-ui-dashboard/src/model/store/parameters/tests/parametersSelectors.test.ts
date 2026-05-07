// (C) 2026 GoodData Corporation

import { describe, expect, it, vi } from "vitest";

import {
    type IDashboard,
    type IDashboardParameter,
    type IInsight,
    type IInsightParameterValue,
    type IParameterMetadataObject,
    idRef,
} from "@gooddata/sdk-model";

vi.mock("../../insights/insightsSelectors.js", () => ({
    selectInsightByWidgetRef: (widgetRef: { identifier: string } | undefined) => () => {
        if (!widgetRef) return undefined;
        return WIDGET_INSIGHT_MAP[widgetRef.identifier];
    },
}));

const WIDGET_INSIGHT_MAP: Record<string, IInsight | undefined> = {};

import { type DashboardState } from "../../types.js";
import {
    selectDashboardParameterEntries,
    selectDashboardParameters,
    selectEffectiveParameterValuesForWidget,
    selectIsParametersChanged,
    selectParameterRuntimeOverrideByRef,
    selectSmartPersistedDashboardParameters,
} from "../parametersSelectors.js";
import { type IDashboardParameterEntry } from "../parametersState.js";

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
    return { parameters: { parameters } } as DashboardState;
}

interface IFullStateOptions {
    entries: IDashboardParameterEntry[];
    workspaceParameters?: IParameterMetadataObject[];
    catalogStatus?: "loaded" | "loading" | "failed" | "gated-off" | "uninitialized";
    persistedDashboardParameters?: IDashboardParameter[];
    enableParameters?: boolean;
}

function makeFullState({
    entries,
    workspaceParameters = [],
    catalogStatus = "loaded",
    persistedDashboardParameters,
    enableParameters = true,
}: IFullStateOptions): DashboardState {
    const persistedDashboard: Partial<IDashboard> | undefined =
        persistedDashboardParameters === undefined
            ? undefined
            : ({ parameters: persistedDashboardParameters } as Partial<IDashboard>);
    return {
        parameters: { parameters: entries },
        catalog: {
            parameters: { status: catalogStatus, parameters: workspaceParameters },
        },
        meta: { persistedDashboard },
        config: { config: { settings: { enableParameters } } },
    } as unknown as DashboardState;
}

describe("parameter selectors", () => {
    it("selectDashboardParameters returns persisted-shape entries", () => {
        expect(selectDashboardParameters(makeState([entry]))).toEqual([topNParameter]);
    });

    it("selectDashboardParameterEntries returns full entries", () => {
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

    describe("selectSmartPersistedDashboardParameters", () => {
        it("omits value when runtimeOverride equals workspace default", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 10 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedDashboardParameters(state)).toEqual([
                { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            ]);
        });

        it("emits value when runtimeOverride differs from workspace default", () => {
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedDashboardParameters(state)).toEqual([
                { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 25 },
            ]);
        });

        it("omits label when equal to workspace title", () => {
            const state = makeFullState({
                entries: [
                    {
                        parameter: { ...topNParameter, label: "Top N" },
                        runtimeOverride: 10,
                    },
                ],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedDashboardParameters(state)).toEqual([
                { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            ]);
        });

        it("preserves label when different from workspace title", () => {
            const state = makeFullState({
                entries: [
                    {
                        parameter: { ...topNParameter, label: "Custom Label" },
                        runtimeOverride: 10,
                    },
                ],
                workspaceParameters: [topNWorkspace],
            });
            expect(selectSmartPersistedDashboardParameters(state)).toEqual([
                { ref: topNRef, parameterType: "NUMBER", mode: "active", label: "Custom Label" },
            ]);
        });

        it("emits non-resolved entry verbatim from persistedDashboard when catalog status is not loaded", () => {
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
            expect(selectSmartPersistedDashboardParameters(state)).toEqual([persisted]);
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
            expect(selectSmartPersistedDashboardParameters(state)).toEqual([persisted]);
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
        const widgetRef = idRef("w-1", "insight");
        const sampleSizeRef = idRef("sampleSize", "parameter");

        function setInsight(parameterValues: IInsightParameterValue[]): IInsight {
            const insight = {
                insight: {
                    parameters: parameterValues,
                },
            } as unknown as IInsight;
            WIDGET_INSIGHT_MAP[widgetRef.identifier] = insight;
            return insight;
        }

        it("returns runtimeOverride for parameters referenced by the insight", () => {
            setInsight([{ ref: topNRef, value: 0 }]);
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
        });

        it("excludes dashboard parameters not referenced by the insight", () => {
            setInsight([{ ref: topNRef, value: 0 }]);
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
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([
                { ref: topNRef, value: 25 },
            ]);
        });

        it("returns identical reference when an unrelated parameter is added (defFingerprint stability)", () => {
            setInsight([{ ref: topNRef, value: 0 }]);
            const stateWithoutUnrelated = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
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
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(stateWithoutUnrelated)).toEqual(
                selectEffectiveParameterValuesForWidget(widgetRef)(stateWithUnrelated),
            );
        });

        it("returns empty array when widget has no insight", () => {
            const missingRef = idRef("missing", "insight");
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
            });
            expect(selectEffectiveParameterValuesForWidget(missingRef)(state)).toEqual([]);
        });

        it("returns empty array when enableParameters is off", () => {
            setInsight([{ ref: topNRef, value: 0 }]);
            const state = makeFullState({
                entries: [{ parameter: topNParameter, runtimeOverride: 25 }],
                enableParameters: false,
            });
            expect(selectEffectiveParameterValuesForWidget(widgetRef)(state)).toEqual([]);
        });
    });
});
