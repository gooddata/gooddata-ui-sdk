// (C) 2020-2022 GoodData Corporation
import { IInsight, insightTitle, newInsightDefinition } from "@gooddata/sdk-model";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { BarChartDescriptor } from "../pluggableVisualizations/barChart/BarChartDescriptor";
import { CatalogViaTypeToClassMap, FullVisualizationCatalog } from "../VisualizationCatalog";
import { recordedInsights } from "@gooddata/sdk-backend-mockingbird";
import { ReferenceRecordings } from "@gooddata/reference-workspace";

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
        const result = TestCatalog.hasDescriptorForInsight(newInsightDefinition("local:unknownType"));

        expect(result).toBeFalsy();
    });

    it("throws when URI cannot be resolved", () => {
        expect(() => TestCatalog.forUri("local:nonsense")).toThrowError(UnexpectedSdkError);
    });

    it("throws when insight cannot be resolved", () => {
        expect(() => TestCatalog.forInsight(newInsightDefinition("local:nonsense"))).toThrowError(
            UnexpectedSdkError,
        );
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
                        locale: "en-US",
                        separators: { decimal: ".", thousand: "," },
                        userId: "user",
                        workspace: "workspace",
                    },
                },
                language: "ts",
            }),
        ).toMatchSnapshot();
    });
});
