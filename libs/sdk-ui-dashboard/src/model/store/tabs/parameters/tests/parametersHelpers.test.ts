// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboardParameter,
    type IInsightDefinition,
    type IParameterMetadataObject,
    type IdentifierRef,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";

import {
    classifyParameterReconciliation,
    collectParameterReconciliations,
    collectReferencedParameterRefs,
    computeHydratedRuntimeOverride,
    formatDashboardParameter,
    resolveEffectiveParameterValuesForRefs,
} from "../parametersHelpers.js";
import { type IDashboardParameterEntry } from "../parametersState.js";

const topNRef: IdentifierRef = idRef("topN", "parameter");
const sampleSizeRef: IdentifierRef = idRef("sampleSize", "parameter");
const metricARef: IdentifierRef = idRef("metric-A", "measure");
const metricBRef: IdentifierRef = idRef("metric-B", "measure");

function makeInsightWithMetrics(metricRefs: IdentifierRef[]): IInsightDefinition {
    return {
        insight: {
            title: "insight",
            visualizationUrl: "local:test",
            buckets: [
                {
                    items: metricRefs.map((metricRef, idx) => ({
                        measure: {
                            localIdentifier: `metric-${idx}`,
                            definition: { measureDefinition: { item: metricRef } },
                        },
                    })),
                },
            ],
            filters: [],
            sorts: [],
            properties: {},
            parameters: [],
        },
    };
}

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

const boundedWorkspace: IParameterMetadataObject = {
    ...topNWorkspace,
    definition: { type: "NUMBER", defaultValue: 10, constraints: { min: 0, max: 100 } },
};

const scenarioRef: IdentifierRef = idRef("scenario", "parameter");

const scenarioWorkspace: IParameterMetadataObject = {
    type: "parameter",
    id: "scenario",
    uri: "/scenario",
    ref: scenarioRef,
    title: "Scenario",
    description: "",
    production: true,
    deprecated: false,
    unlisted: false,
    definition: { type: "STRING", defaultValue: "Actual" },
};

const boundedScenarioWorkspace: IParameterMetadataObject = {
    ...scenarioWorkspace,
    definition: { type: "STRING", defaultValue: "Actual", constraints: { maxLength: 6 } },
};

describe("computeHydratedRuntimeOverride", () => {
    const parameterWithValue = (value: number): IDashboardParameter => ({
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
        value,
    });

    it("seeds the persisted value verbatim, even when out of range (recovery happens at execution)", () => {
        expect(computeHydratedRuntimeOverride(parameterWithValue(999), boundedWorkspace)).toBe(999);
    });

    it("keeps an in-range persisted value (incl. the inclusive boundaries)", () => {
        expect(computeHydratedRuntimeOverride(parameterWithValue(42), boundedWorkspace)).toBe(42);
        expect(computeHydratedRuntimeOverride(parameterWithValue(0), boundedWorkspace)).toBe(0);
        expect(computeHydratedRuntimeOverride(parameterWithValue(100), boundedWorkspace)).toBe(100);
    });

    it("keeps the persisted value when the workspace parameter has no constraints", () => {
        expect(computeHydratedRuntimeOverride(parameterWithValue(999), topNWorkspace)).toBe(999);
    });

    it("seeds the value verbatim regardless of min-only or max-only bounds", () => {
        const minOnly: IParameterMetadataObject = {
            ...topNWorkspace,
            definition: { type: "NUMBER", defaultValue: 5, constraints: { min: 0 } },
        };
        const maxOnly: IParameterMetadataObject = {
            ...topNWorkspace,
            definition: { type: "NUMBER", defaultValue: 5, constraints: { max: 100 } },
        };
        expect(computeHydratedRuntimeOverride(parameterWithValue(-1), minOnly)).toBe(-1);
        expect(computeHydratedRuntimeOverride(parameterWithValue(1000), minOnly)).toBe(1000);
        expect(computeHydratedRuntimeOverride(parameterWithValue(1000), maxOnly)).toBe(1000);
        expect(computeHydratedRuntimeOverride(parameterWithValue(-1000), maxOnly)).toBe(-1000);
    });

    it("passes an out-of-range value through when the workspace parameter is unresolved (e.g. catalog not loaded)", () => {
        expect(computeHydratedRuntimeOverride(parameterWithValue(999), undefined)).toBe(999);
    });

    it("seeds the workspace default when no value is persisted", () => {
        const parameter: IDashboardParameter = { ref: topNRef, parameterType: "NUMBER", mode: "active" };
        expect(computeHydratedRuntimeOverride(parameter, boundedWorkspace)).toBe(10);
        expect(computeHydratedRuntimeOverride(parameter, undefined)).toBeUndefined();
    });

    it("seeds a persisted string value verbatim", () => {
        const parameter: IDashboardParameter = {
            ref: scenarioRef,
            parameterType: "STRING",
            mode: "active",
            value: "Budget",
        };
        expect(computeHydratedRuntimeOverride(parameter, scenarioWorkspace)).toBe("Budget");
    });

    it("seeds the string workspace default when no value is persisted", () => {
        const parameter: IDashboardParameter = { ref: scenarioRef, parameterType: "STRING", mode: "active" };
        expect(computeHydratedRuntimeOverride(parameter, scenarioWorkspace)).toBe("Actual");
    });
});

describe("classifyParameterReconciliation", () => {
    const persistedOutOfRange: IDashboardParameter = {
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
        value: 999,
    };

    it("classifies a ref absent from the catalog as removed", () => {
        expect(classifyParameterReconciliation(persistedOutOfRange, undefined)).toBe("removed");
    });

    it("classifies a workspace parameter that is no longer a NUMBER as incompatible", () => {
        const nonNumberWorkspace: IParameterMetadataObject = {
            ...topNWorkspace,
            definition: scenarioWorkspace.definition,
        };
        expect(classifyParameterReconciliation(persistedOutOfRange, nonNumberWorkspace)).toBe("incompatible");
    });

    it("classifies a NUMBER parameter with an out-of-range persisted value as reset", () => {
        expect(classifyParameterReconciliation(persistedOutOfRange, boundedWorkspace)).toBe("reset");
    });

    it("returns undefined for a NUMBER parameter whose persisted value is in range", () => {
        const inRange: IDashboardParameter = { ...persistedOutOfRange, value: 42 };
        expect(classifyParameterReconciliation(inRange, boundedWorkspace)).toBeUndefined();
    });

    it("returns undefined for a NUMBER parameter with no persisted value (nothing to validate)", () => {
        const noValue: IDashboardParameter = { ref: topNRef, parameterType: "NUMBER", mode: "active" };
        expect(classifyParameterReconciliation(noValue, boundedWorkspace)).toBeUndefined();
    });

    it("returns undefined for a STRING parameter whose persisted value satisfies the constraints", () => {
        const inRange: IDashboardParameter = {
            ref: scenarioRef,
            parameterType: "STRING",
            mode: "active",
            value: "Budget",
        };
        expect(classifyParameterReconciliation(inRange, boundedScenarioWorkspace)).toBeUndefined();
    });

    it("classifies a STRING parameter with a too-long persisted value as reset", () => {
        const tooLong: IDashboardParameter = {
            ref: scenarioRef,
            parameterType: "STRING",
            mode: "active",
            value: "Forecast",
        };
        expect(classifyParameterReconciliation(tooLong, boundedScenarioWorkspace)).toBe("reset");
    });

    it("classifies a STRING parameter whose workspace parameter is a NUMBER as incompatible", () => {
        const stringParameter: IDashboardParameter = {
            ref: topNRef,
            parameterType: "STRING",
            mode: "active",
            value: "Budget",
        };
        expect(classifyParameterReconciliation(stringParameter, boundedWorkspace)).toBe("incompatible");
    });
});

describe("collectParameterReconciliations", () => {
    it("collects reset, removed and incompatible kinds in entry order", () => {
        const legacyRef = idRef("legacy", "parameter");
        const incompatibleWorkspace: IParameterMetadataObject = {
            ...topNWorkspace,
            id: "legacy",
            uri: "/legacy",
            ref: legacyRef,
            title: "Legacy",
            definition: scenarioWorkspace.definition,
        };
        const entries: IDashboardParameterEntry[] = [
            {
                parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 999 },
                runtimeOverride: 10,
            },
            {
                parameter: { ref: sampleSizeRef, parameterType: "NUMBER", mode: "active", value: 5 },
                runtimeOverride: 5,
            },
            {
                parameter: { ref: legacyRef, parameterType: "NUMBER", mode: "active", value: 5 },
                runtimeOverride: 5,
            },
        ];
        expect(collectParameterReconciliations(entries, [boundedWorkspace, incompatibleWorkspace])).toEqual([
            { ref: topNRef, name: "Top N", kind: "reset" },
            { ref: sampleSizeRef, name: "sampleSize", kind: "removed" },
            { ref: legacyRef, name: "Legacy", kind: "incompatible" },
        ]);
    });

    it("dedupes by ref, surfacing the first entry that fails to reconcile (in-range first, out-of-range later)", () => {
        const entries: IDashboardParameterEntry[] = [
            {
                parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 42 },
                runtimeOverride: 42,
            },
            {
                parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 999 },
                runtimeOverride: 10,
            },
        ];
        expect(collectParameterReconciliations(entries, [boundedWorkspace])).toEqual([
            { ref: topNRef, name: "Top N", kind: "reset" },
        ]);
    });

    it("resolves name via parameter.label → workspace title → ref.identifier", () => {
        const labelled: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 999, label: "Custom" },
            runtimeOverride: 10,
        };
        expect(collectParameterReconciliations([labelled], [boundedWorkspace])[0].name).toBe("Custom");
    });
});

describe("collectReferencedParameterRefs", () => {
    it("returns refs from metric → parameter dependency map, deduped by ref string", () => {
        const insight = makeInsightWithMetrics([metricARef, metricBRef]);
        const measureParameters: Record<string, IdentifierRef[]> = {
            [objRefToString(metricARef)]: [topNRef, sampleSizeRef],
            [objRefToString(metricBRef)]: [topNRef],
        };
        const result = collectReferencedParameterRefs(insight, measureParameters);
        expect(result).toEqual([topNRef, sampleSizeRef]);
    });

    it("returns empty when no metric has dependencies", () => {
        const insight = makeInsightWithMetrics([metricARef]);
        const result = collectReferencedParameterRefs(insight, {});
        expect(result).toEqual([]);
    });

    it("returns empty for an insight without metric definitions", () => {
        const insight = makeInsightWithMetrics([]);
        const result = collectReferencedParameterRefs(insight, {
            [objRefToString(metricARef)]: [topNRef],
        });
        expect(result).toEqual([]);
    });
});

describe("formatDashboardParameter", () => {
    it("emits the stringified runtimeOverride as value", () => {
        const entry: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 25 },
            runtimeOverride: 99,
        };
        expect(formatDashboardParameter(entry, topNWorkspace)?.value).toBe("99");
    });

    it("substitutes the workspace default for an out-of-range runtimeOverride (export recovery)", () => {
        const entry: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 999 },
            runtimeOverride: 999,
        };
        expect(formatDashboardParameter(entry, boundedWorkspace)?.value).toBe("10");
    });

    it("returns undefined when runtimeOverride is undefined, regardless of pinned/default value", () => {
        const withPinned: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", value: 25 },
            runtimeOverride: undefined,
        };
        expect(formatDashboardParameter(withPinned, topNWorkspace)).toBeUndefined();

        const withWorkspaceDefault: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            runtimeOverride: undefined,
        };
        expect(formatDashboardParameter(withWorkspaceDefault, topNWorkspace)).toBeUndefined();

        const allMissing: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            runtimeOverride: undefined,
        };
        expect(formatDashboardParameter(allMissing, undefined)).toBeUndefined();
    });

    it("stringifies a runtimeOverride of 0 (not falsy-skipped)", () => {
        const entry: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            runtimeOverride: 0,
        };
        expect(formatDashboardParameter(entry, topNWorkspace)?.value).toBe("0");
    });

    it("resolves title via parameter.label → workspace title → ref.identifier", () => {
        const labelled: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", label: "Custom" },
            runtimeOverride: 1,
        };
        expect(formatDashboardParameter(labelled, topNWorkspace)?.title).toBe("Custom");

        const fromWorkspace: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            runtimeOverride: 1,
        };
        expect(formatDashboardParameter(fromWorkspace, topNWorkspace)?.title).toBe("Top N");

        const fromIdentifier: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            runtimeOverride: 1,
        };
        expect(formatDashboardParameter(fromIdentifier, undefined)?.title).toBe("topN");
    });

    it("treats an empty-string label as falsy and falls through to workspace title", () => {
        const emptyLabel: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active", label: "" },
            runtimeOverride: 1,
        };
        expect(formatDashboardParameter(emptyLabel, topNWorkspace)?.title).toBe("Top N");
    });

    it("emits ref.identifier as id", () => {
        const entry: IDashboardParameterEntry = {
            parameter: { ref: topNRef, parameterType: "NUMBER", mode: "active" },
            runtimeOverride: 42,
        };
        expect(formatDashboardParameter(entry, topNWorkspace)?.id).toBe("topN");
    });

    it("emits a string runtimeOverride verbatim", () => {
        const entry: IDashboardParameterEntry = {
            parameter: { ref: scenarioRef, parameterType: "STRING", mode: "active" },
            runtimeOverride: "Budget",
        };
        expect(formatDashboardParameter(entry, scenarioWorkspace)?.value).toBe("Budget");
    });
});

describe("resolveEffectiveParameterValuesForRefs", () => {
    const overrideEntry = (
        ref: IdentifierRef,
        runtimeOverride: number | undefined,
    ): IDashboardParameterEntry => ({
        parameter: { ref, parameterType: "NUMBER", mode: "active" },
        runtimeOverride,
    });

    const noWorkspace = new Map<string, IParameterMetadataObject>();
    const boundedByRef = new Map([[objRefToString(topNRef), boundedWorkspace]]);

    it("includes a dashboard override for a referenced ref", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, 1000)],
            [topNRef],
            [],
            noWorkspace,
        );
        expect(result).toEqual([{ ref: topNRef, value: 1000 }]);
    });

    it("excludes a dashboard override whose ref the executed insight does not reference", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, 1000)],
            [sampleSizeRef],
            [],
            noWorkspace,
        );
        expect(result).toEqual([]);
    });

    it("skips an entry without a runtimeOverride", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, undefined)],
            [topNRef],
            [],
            noWorkspace,
        );
        expect(result).toEqual([]);
    });

    it("falls back to the insight's own parameter value when no dashboard override exists", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [],
            [topNRef],
            [{ ref: topNRef, value: 50 }],
            noWorkspace,
        );
        expect(result).toEqual([{ ref: topNRef, value: 50 }]);
    });

    it("prefers the dashboard override over the insight's own parameter value for the same ref", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, 1000)],
            [topNRef],
            [{ ref: topNRef, value: 50 }],
            noWorkspace,
        );
        expect(result).toEqual([{ ref: topNRef, value: 1000 }]);
    });

    it("excludes an insight's own parameter value whose ref the executed insight does not reference", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [],
            [topNRef],
            [{ ref: sampleSizeRef, value: 50 }],
            noWorkspace,
        );
        expect(result).toEqual([]);
    });

    it("substitutes the workspace default for an out-of-range dashboard override (recovery)", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, 1000)],
            [topNRef],
            [],
            boundedByRef,
        );
        expect(result).toEqual([{ ref: topNRef, value: 10 }]);
    });

    it("keeps an in-range dashboard override when the workspace parameter has constraints", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, 42)],
            [topNRef],
            [],
            boundedByRef,
        );
        expect(result).toEqual([{ ref: topNRef, value: 42 }]);
    });

    it("substitutes the workspace default for a number override when the workspace parameter is a STRING (recovery)", () => {
        const stringTypedByRef = new Map([[objRefToString(topNRef), { ...scenarioWorkspace, ref: topNRef }]]);
        const result = resolveEffectiveParameterValuesForRefs(
            [overrideEntry(topNRef, 1000)],
            [topNRef],
            [],
            stringTypedByRef,
        );
        expect(result).toEqual([{ ref: topNRef, value: "Actual" }]);
    });

    it("substitutes the workspace default for an out-of-range insight parameter value (recovery)", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [],
            [topNRef],
            [{ ref: topNRef, value: 1000 }],
            boundedByRef,
        );
        expect(result).toEqual([{ ref: topNRef, value: 10 }]);
    });

    it("keeps an in-range insight parameter value when the workspace parameter has constraints", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [],
            [topNRef],
            [{ ref: topNRef, value: 42 }],
            boundedByRef,
        );
        expect(result).toEqual([{ ref: topNRef, value: 42 }]);
    });

    const stringOverrideEntry = (runtimeOverride: string): IDashboardParameterEntry => ({
        parameter: { ref: scenarioRef, parameterType: "STRING", mode: "active" },
        runtimeOverride,
    });

    it("includes a string dashboard override for a referenced ref", () => {
        const result = resolveEffectiveParameterValuesForRefs(
            [stringOverrideEntry("Budget")],
            [scenarioRef],
            [],
            noWorkspace,
        );
        expect(result).toEqual([{ ref: scenarioRef, value: "Budget" }]);
    });

    it("substitutes the string workspace default for a too-long string override (recovery)", () => {
        const boundedScenarioByRef = new Map([[objRefToString(scenarioRef), boundedScenarioWorkspace]]);
        const result = resolveEffectiveParameterValuesForRefs(
            [stringOverrideEntry("Forecast")],
            [scenarioRef],
            [],
            boundedScenarioByRef,
        );
        expect(result).toEqual([{ ref: scenarioRef, value: "Actual" }]);
    });

    it("substitutes the workspace default for a string override when the workspace parameter is a NUMBER (recovery)", () => {
        const numberTypedByRef = new Map([
            [objRefToString(scenarioRef), { ...boundedWorkspace, ref: scenarioRef }],
        ]);
        const result = resolveEffectiveParameterValuesForRefs(
            [stringOverrideEntry("Budget")],
            [scenarioRef],
            [],
            numberTypedByRef,
        );
        expect(result).toEqual([{ ref: scenarioRef, value: 10 }]);
    });
});
