// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import type { IChatConversationVisualisationContent } from "@gooddata/sdk-backend-spi";
import type { IAttribute, IMeasure, IMeasureDescriptor } from "@gooddata/sdk-model";

import { changeAnalysisDrills } from "../changeAnalysisDrills.js";

describe("changeAnalysisDrills", () => {
    const measure1: IMeasure = {
        measure: {
            localIdentifier: "m1",
            definition: {
                measureDefinition: {
                    item: { uri: "/uri1" },
                },
            },
        },
    };

    const measure2: IMeasure = {
        measure: {
            localIdentifier: "m2",
            definition: {
                measureDefinition: {
                    item: { uri: "/uri2" },
                },
            },
        },
    };

    const attribute1: IAttribute = {
        attribute: {
            localIdentifier: "a1",
            displayForm: { uri: "/df1" },
        },
    };

    const visualization: IChatConversationVisualisationContent["visualization"] = {
        insight: {
            visualizationUrl: "local:line",
            ref: { uri: "/insight" },
            identifier: "insight",
            uri: "/insight",
            title: "Insight",
            sorts: [],
            created: "2026-06-19",
            updated: "2026-06-19",
            tags: [],
            isLocked: false,
            filters: [],
            buckets: [
                {
                    localIdentifier: "b1",
                    items: [measure1, attribute1],
                },
                {
                    localIdentifier: "b2",
                    items: [measure2],
                },
            ],
            properties: {
                controls: {
                    disableKeyDriveAnalysisOn: {
                        m2: true,
                    },
                },
            },
        },
    };

    it("should return empty array if visualization is undefined", () => {
        expect(changeAnalysisDrills(undefined, true, true)).toEqual([]);
    });

    it("should return empty array if enableDrilling is false", () => {
        expect(changeAnalysisDrills(visualization, false, true)).toEqual([]);
    });

    it("should return empty array if enableChangeAnalysis is false", () => {
        expect(changeAnalysisDrills(visualization, true, false)).toEqual([]);
    });

    it("should return empty array if visualization has no insight", () => {
        const visualizationNoInsight = { ...visualization, insight: undefined };
        expect(changeAnalysisDrills(visualizationNoInsight as any, true, true)).toEqual([]);
    });

    it("should return predicates for measures that are not disabled", () => {
        const result = changeAnalysisDrills(visualization, true, true);
        expect(result).toHaveLength(1); // Only m1, because m2 is disabled and a1 is an attribute
    });

    it("should return all measures if none are disabled", () => {
        const visualizationNoDisabled: IChatConversationVisualisationContent["visualization"] = {
            ...visualization,
            insight: {
                ...visualization!.insight!,
                properties: {
                    controls: {
                        disableKeyDriveAnalysisOn: {},
                    },
                },
            },
        };
        const result = changeAnalysisDrills(visualizationNoDisabled, true, true);
        expect(result).toHaveLength(2);
    });

    it("should return predicates that correctly match measures", () => {
        const result = changeAnalysisDrills(visualization, true, true);
        const predicate = result[0];

        const m1Descriptor: IMeasureDescriptor = {
            measureHeaderItem: {
                localIdentifier: "m1",
                format: "#,##0",
                name: "Measure 1",
                uri: "/uri1",
                identifier: "m1",
            },
        };

        const m2Descriptor: IMeasureDescriptor = {
            measureHeaderItem: {
                localIdentifier: "m2",
                format: "#,##0",
                name: "Measure 2",
                uri: "/uri2",
                identifier: "m2",
            },
        };

        expect(predicate(m1Descriptor, {} as any)).toBe(true);
        expect(predicate(m2Descriptor, {} as any)).toBe(false);
        expect(predicate({} as any, {} as any)).toBe(false);
    });

    it("should handle missing properties or controls", () => {
        const visualizationNoControls: IChatConversationVisualisationContent["visualization"] = {
            ...visualization,
            insight: {
                ...visualization!.insight!,
                properties: {},
            },
        };
        const result = changeAnalysisDrills(visualizationNoControls, true, true);
        expect(result).toHaveLength(2); // Both m1 and m2 should have predicates
    });

    it("should handle empty buckets", () => {
        const visualizationEmptyBuckets: IChatConversationVisualisationContent["visualization"] = {
            ...visualization,
            insight: {
                ...visualization!.insight!,
                buckets: [],
            },
        };
        const result = changeAnalysisDrills(visualizationEmptyBuckets, true, true);
        expect(result).toEqual([]);
    });
});
