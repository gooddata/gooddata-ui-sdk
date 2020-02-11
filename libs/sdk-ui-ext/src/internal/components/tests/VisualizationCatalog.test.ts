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

    it("resolves insight", () => {
        const factory = TestCatalog.forInsight(newInsightDefinition("local:someType"));

        expect(factory).toBeDefined();
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
