// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    idRef,
    localIdRef,
    newAbsoluteDateFilter,
    newAttribute,
    newBucket,
    newDefForItems,
    newInsightDefinition,
    newMeasure,
    newMeasureValueFilter,
    newPositiveAttributeFilter,
    newRankingFilter,
} from "@gooddata/sdk-model";

import { BucketNames } from "../../constants/bucketNames.js";
import { createExportExecutionDefinition } from "../createExportExecutionDefinition.js";

describe("createExportExecutionDefinition", () => {
    const workspace = "workspaceId";
    const attribute = newAttribute(idRef("label.city", "displayForm"), (a) => a.localId("city"));
    const insightFilter = newPositiveAttributeFilter(idRef("layer.df", "displayForm"), ["B"]);
    const baseFilter = newPositiveAttributeFilter(idRef("base.df", "displayForm"), ["A"]);

    const insightWithFilters = newInsightDefinition("local:table", (i) =>
        i.buckets([newBucket(BucketNames.ATTRIBUTE, attribute)]).filters([insightFilter]),
    );
    const baseDefinition = newDefForItems(workspace, [attribute], [baseFilter]);

    it("keeps only the base definition's filters by default", () => {
        const definition = createExportExecutionDefinition(insightWithFilters, workspace, baseDefinition);

        expect(definition.filters).toEqual([baseFilter]);
    });

    it("merges the insight's filters with the base definition's when opted in", () => {
        const definition = createExportExecutionDefinition(insightWithFilters, workspace, baseDefinition, {
            includeInsightFilters: true,
        });

        expect(definition.filters).toEqual([insightFilter, baseFilter]);
    });

    it("does not duplicate filters carried by both the insight and the base definition", () => {
        // the base execution typically already resolves the root insight's filters, so the same
        // filter arrives from both sides of the merge
        const insightFilterCopy = newPositiveAttributeFilter(idRef("layer.df", "displayForm"), ["B"]);
        const base = newDefForItems(workspace, [attribute], [insightFilterCopy, baseFilter]);

        const definition = createExportExecutionDefinition(insightWithFilters, workspace, base, {
            includeInsightFilters: true,
        });

        expect(definition.filters).toEqual([insightFilter, baseFilter]);
    });

    it("lets the base definition win date filter conflicts when merging", () => {
        const insightDateFilter = newAbsoluteDateFilter(idRef("dataset"), "2020-01-01", "2020-06-30");
        const baseDateFilter = newAbsoluteDateFilter(idRef("dataset"), "2021-01-01", "2021-12-31");
        const insight = newInsightDefinition("local:table", (i) =>
            i.buckets([newBucket(BucketNames.ATTRIBUTE, attribute)]).filters([insightDateFilter]),
        );
        const base = newDefForItems(workspace, [attribute], [baseDateFilter]);

        const definition = createExportExecutionDefinition(insight, workspace, base, {
            includeInsightFilters: true,
        });

        expect(definition.filters).toEqual([baseDateFilter]);
    });

    describe("local-id measure filter routing when merging", () => {
        const layerMeasure = newMeasure(idRef("measure.size"), (m) => m.localId("m_size"));
        const layerInsight = newInsightDefinition("local:table", (i) =>
            i.buckets([
                newBucket(BucketNames.MEASURES, layerMeasure),
                newBucket(BucketNames.ATTRIBUTE, attribute),
            ]),
        );

        it("drops base measure value filters referencing measures absent from the insight", () => {
            const rootMeasureFilter = newMeasureValueFilter(localIdRef("m_root"), "GREATER_THAN", 100);
            const base = newDefForItems(workspace, [attribute, layerMeasure], [rootMeasureFilter]);

            const definition = createExportExecutionDefinition(layerInsight, workspace, base, {
                includeInsightFilters: true,
            });

            expect(definition.filters).toEqual([]);
        });

        it("keeps measure value filters referencing measures present in the insight", () => {
            const layerMeasureFilter = newMeasureValueFilter(localIdRef("m_size"), "GREATER_THAN", 100);
            const base = newDefForItems(workspace, [attribute, layerMeasure], [layerMeasureFilter]);

            const definition = createExportExecutionDefinition(layerInsight, workspace, base, {
                includeInsightFilters: true,
            });

            expect(definition.filters).toEqual([layerMeasureFilter]);
        });

        it("drops ranking filters referencing local identifiers absent from the insight", () => {
            const rootRankingFilter = newRankingFilter(localIdRef("m_root"), "TOP", 3);
            const base = newDefForItems(workspace, [attribute, layerMeasure], [rootRankingFilter]);

            const definition = createExportExecutionDefinition(layerInsight, workspace, base, {
                includeInsightFilters: true,
            });

            expect(definition.filters).toEqual([]);
        });

        it("keeps non-applicable base filters untouched when not opted in", () => {
            const rootMeasureFilter = newMeasureValueFilter(localIdRef("m_root"), "GREATER_THAN", 100);
            const base = newDefForItems(workspace, [attribute, layerMeasure], [rootMeasureFilter]);

            const definition = createExportExecutionDefinition(layerInsight, workspace, base);

            expect(definition.filters).toEqual([rootMeasureFilter]);
        });

        it("remaps filter dimensionality to replaced attribute local ids before the applicability check", () => {
            // the geo table conversion replaces "city" with the default display form under a new local id
            const replacedAttribute = newAttribute(idRef("label.default", "displayForm"), (a) =>
                a.localId("city_table_default_label"),
            );
            const insight = newInsightDefinition("local:table", (i) =>
                i.buckets([
                    newBucket(BucketNames.MEASURES, layerMeasure),
                    newBucket(BucketNames.ATTRIBUTE, replacedAttribute),
                ]),
            );
            const mvf = newMeasureValueFilter(localIdRef("m_size"), "GREATER_THAN", 100);
            const mvfWithDimensionality = {
                measureValueFilter: {
                    ...mvf.measureValueFilter,
                    dimensionality: [localIdRef("city")],
                },
            };
            const base = newDefForItems(
                workspace,
                [replacedAttribute, layerMeasure],
                [mvfWithDimensionality],
            );

            const withoutMapping = createExportExecutionDefinition(insight, workspace, base, {
                includeInsightFilters: true,
            });
            expect(withoutMapping.filters).toEqual([]);

            const withMapping = createExportExecutionDefinition(insight, workspace, base, {
                includeInsightFilters: true,
                attributeLocalIdMapping: { city: "city_table_default_label" },
            });
            expect(withMapping.filters).toEqual([
                {
                    measureValueFilter: {
                        ...mvf.measureValueFilter,
                        dimensionality: [localIdRef("city_table_default_label")],
                    },
                },
            ]);
        });
    });
});
