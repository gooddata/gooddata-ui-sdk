// (C) 2020 GoodData Corporation
import { newInsightDefinition } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { PluggableBarChart } from "../pluggableVisualizations/barChart/PluggableBarChart";
import { CatalogViaTypeToClassMap } from "../VisualizationCatalog";

describe("CatalogViaTypeToClassMap", () => {
    const TestCatalog = new CatalogViaTypeToClassMap({ someType: PluggableBarChart });
    it("resolves URI", () => {
        const factory = TestCatalog.forUri("local:someType");

        expect(factory).toBeDefined();
    });

    it("indicates support for URI", () => {
        const result = TestCatalog.hasFactoryForUri("local:someType");

        expect(result).toBeTruthy();
    });

    it("indicates no support for unknown URI", () => {
        const result = TestCatalog.hasFactoryForUri("local:unknownType");

        expect(result).toBeFalsy();
    });

    it("resolves insight", () => {
        const factory = TestCatalog.forInsight(newInsightDefinition("local:someType"));

        expect(factory).toBeDefined();
    });

    it("indicates support for insight", () => {
        const result = TestCatalog.hasFactoryForInsight(newInsightDefinition("local:someType"));

        expect(result).toBeTruthy();
    });

    it("indicates no support for insight with unknown visualization class", () => {
        const result = TestCatalog.hasFactoryForInsight(newInsightDefinition("local:unknownType"));

        expect(result).toBeFalsy();
    });

    it("throws when URI cannot be resolved", () => {
        expect(() => TestCatalog.forUri("local:nonsense")).toThrowError(GoodDataSdkError);
    });

    it("throws when insight cannot be resolved", () => {
        expect(() => TestCatalog.forInsight(newInsightDefinition("local:nonsense"))).toThrowError(
            GoodDataSdkError,
        );
    });
});
