// (C) 2020-2025 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { recordedInsights } from "@gooddata/sdk-backend-mockingbird";
import { IInsight, insightTitle, newInsightDefinition } from "@gooddata/sdk-model";
import { Matcher, suppressConsole } from "@gooddata/util";

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

    it.each(scenarios)("should generate code for %s", (_, insight) => {
        const descriptor = FullVisualizationCatalog.forInsight(insight);
        expect(
            descriptor.getEmbeddingCode?.(insight, {
                context: {
                    settings: {
                        enableAxisNameConfiguration: true,
                        enableTableTotalRows: true,
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
                language: "ts",
            }),
        ).toMatchSnapshot();
    });
});
