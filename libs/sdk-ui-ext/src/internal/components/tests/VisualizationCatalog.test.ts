// (C) 2020-2026 GoodData Corporation

import { omit } from "lodash-es";
import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedInsights } from "@gooddata/sdk-backend-mockingbird";
import { type IInsight, insightTitle, newInsightDefinition } from "@gooddata/sdk-model";
import { type Matcher, suppressConsole } from "@gooddata/util";

import { BarChartDescriptor } from "../pluggableVisualizations/barChart/BarChartDescriptor.js";
import { CatalogViaTypeToClassMap, FullVisualizationCatalog } from "../VisualizationCatalog.js";

describe("CatalogViaTypeToClassMap", () => {
    const TestCatalog = new CatalogViaTypeToClassMap({ someType: BarChartDescriptor });
    it("resolves URI", () => {
        const factory = TestCatalog.forUri("local:someType");

        expect(factory).toBeDefined();
    });

    it("indicates support for URI", () => {
        const result = TestCatalog.hasDescriptorForUri("local:someType");

        expect(result).toBeTruthy();
    });

    it("indicates no support for unknown URI", () => {
        const result = TestCatalog.hasDescriptorForUri("local:unknownType");

        expect(result).toBeFalsy();
    });

    it("resolves insight", () => {
        const factory = TestCatalog.forInsight(newInsightDefinition("local:someType"));

        expect(factory).toBeDefined();
    });

    it("indicates support for insight", () => {
        const result = TestCatalog.hasDescriptorForInsight(newInsightDefinition("local:someType"));

        expect(result).toBeTruthy();
    });

    const commonWarnOutput: Matcher[] = [
        {
            type: "startsWith",
            value: "Unknown visualization class: local:unknownType",
        },
    ];

    it("indicates no support for insight with unknown visualization class", async () => {
        const result = await suppressConsole(
            () => TestCatalog.forInsight(newInsightDefinition("local:unknownType")),
            "warn",
            commonWarnOutput,
        );

        expect(result.getMeta()).toEqual({
            documentationUrl: `unknown: local:unknownType`,
            supportsExport: false,
            supportsZooming: false,
        });
    });

    it("throws when URI cannot be resolved", async () => {
        const result = await suppressConsole(
            () => TestCatalog.forUri("local:unknownType"),
            "warn",
            commonWarnOutput,
        );

        expect(result.getMeta()).toEqual({
            documentationUrl: `unknown: local:unknownType`,
            supportsExport: false,
            supportsZooming: false,
        });
    });
});

describe("getEmbeddingCode functionality", () => {
    const scenarios: [string, IInsight][] = recordedInsights(ReferenceRecordings.Recordings).map((i) => [
        insightTitle(i),
        i,
    ]);

    const embeddingCodeConfig = {
        context: {
            settings: {
                locale: "en-US",
                separators: { decimal: ".", thousand: "," },
                userId: "user",
                workspace: "workspace",
            },
            backend: {
                capabilities: {
                    canCalculateGrandTotals: true,
                    canCalculateNativeTotals: true,
                    canCalculateSubTotals: true,
                    canCalculateTotals: true,
                },
            } as any,
        },
        language: "ts" as const,
    };

    // fields identifying the insight object itself; the embedding code is derived from the visualization
    // class, buckets, filters, sorts, layers and properties only
    const insightIdentityFields = [
        "title",
        "summary",
        "identifier",
        "uri",
        "ref",
        "created",
        "updated",
        "tags",
    ];

    /**
     * Roughly half of the recorded insights (778 out of 1616 at the time of writing) are scenarios sharing
     * a byte-identical insight definition, differing only in their title - the responsive legend scenarios,
     * for example, reuse a single insight for many chart sizes and legend positions. Generating the
     * embedding code is by far the most expensive part of this suite (insight normalization plus factory
     * notation serialization), so it is done once per distinct definition and reused for the remaining
     * scenarios. Each scenario still asserts its own snapshot.
     */
    const codeByDefinition = new Map<string, string | undefined>();

    const getEmbeddingCode = (insight: IInsight): string | undefined => {
        const definitionKey = JSON.stringify(omit(insight.insight, insightIdentityFields));

        if (!codeByDefinition.has(definitionKey)) {
            const descriptor = FullVisualizationCatalog.forInsight(insight);
            codeByDefinition.set(definitionKey, descriptor.getEmbeddingCode?.(insight, embeddingCodeConfig));
        }

        return codeByDefinition.get(definitionKey);
    };

    it.each(scenarios)("should generate code for %s", (_, insight) => {
        expect(getEmbeddingCode(insight)).toMatchSnapshot();
    });
});
