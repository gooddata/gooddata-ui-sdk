// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IInsightDefinition,
    type IParameterMetadataObject,
    type IdentifierRef,
    idRef,
    objRefToString,
} from "@gooddata/sdk-model";

import { collectReferencedParameterRefs, formatDashboardParameter } from "../parametersHelpers.js";
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
});
