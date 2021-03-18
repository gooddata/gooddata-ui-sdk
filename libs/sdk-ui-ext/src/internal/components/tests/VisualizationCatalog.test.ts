// (C) 2020-2021 GoodData Corporation
import { newInsightDefinition } from "@gooddata/sdk-model";
import { UnexpectedSdkError } from "@gooddata/sdk-ui";
import { BarChartDescriptor } from "../pluggableVisualizations/barChart/BarChartDescriptor";
import { CatalogViaTypeToClassMap } from "../VisualizationCatalog";

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
