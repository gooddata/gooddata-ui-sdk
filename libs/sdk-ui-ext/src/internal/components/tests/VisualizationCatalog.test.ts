// (C) 2020-2023 GoodData Corporation
import { IInsight, insightTitle, newInsightDefinition } from "@gooddata/sdk-model";
import { BarChartDescriptor } from "../pluggableVisualizations/barChart/BarChartDescriptor.js";
import { CatalogViaTypeToClassMap, FullVisualizationCatalog } from "../VisualizationCatalog.js";
import { recordedInsights } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import { describe, it, expect } from "vitest";

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

    it("indicates no support for insight with unknown visualization class", () => {
        const result = TestCatalog.forInsight(newInsightDefinition("local:unknownType"));

        expect(result.getMeta()).toEqual({
            documentationUrl: `unknown: local:unknownType`,
            supportsExport: false,
            supportsZooming: false,
        });
    });

    it("throws when URI cannot be resolved", () => {
        const result = TestCatalog.forUri("local:unknownType");

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
                        enableHidingOfDataPoints: true,
                        enableTableColumnsManualResizing: true,
                        enableTableColumnsAutoResizing: true,
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
