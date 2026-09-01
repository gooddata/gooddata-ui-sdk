// (C) 2019-2026 GoodData Corporation

import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

import { ActionsApi_ComputeValidObjects } from "@gooddata/api-client-tiger/endpoints/validObjects";
import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    type CatalogItem,
    type CatalogItemType,
    type ICatalogDateDataset,
    type ICatalogMeasure,
    type IMeasureValueFilter,
    type IRankingFilter,
    type ObjRefInScope,
    attributeLocalId,
    idRef,
    localIdRef,
    measureLocalId,
    newAttribute,
    newMeasure,
} from "@gooddata/sdk-model";

import {
    TigerWorkspaceCatalogAvailableItemsFactory,
    filterAvailableItems,
    sanitizeFiltersForValidObjects,
} from "./availableItemsFactory.js";

vi.mock("@gooddata/api-client-tiger/endpoints/validObjects", () => ({
    ActionsApi_ComputeValidObjects: vi.fn(),
}));

describe("available item filtering", () => {
    describe("item filtering", () => {
        /*
         * Note: the reference workspace recordings are Tiger-shaped, so catalog item refs are
         * identifier refs and the filtering must use idRefs.
         *
         * These tests do not verify ref matching itself but rather whether simple objects or
         * composite objects are filtered in correctly.
         */
        const AllItems: CatalogItem[] = ReferenceRecordings.Recordings.metadata!.catalog!.items;

        it("should return empty result if none match", () => {
            expect(filterAvailableItems([idRef("nonsense")], AllItems)).toEqual([]);
        });

        it("should filter-in simple object if ref matches", () => {
            const result = filterAvailableItems([idRef("of_activities", "measure")], AllItems);

            expect(result).toHaveLength(1);
            expect((result[0] as ICatalogMeasure).measure.id).toEqual("of_activities");
        });

        it("should filter-in date dataset if attribute ref matches", () => {
            const result = filterAvailableItems([idRef("dt_activity_timestamp.day", "attribute")], AllItems);

            expect(result).toHaveLength(1);
            expect((result[0] as ICatalogDateDataset).dataSet.id).toEqual("dt_activity_timestamp");
        });
    });

    describe("computed attributes", () => {
        const displayForm = {
            type: "displayForm" as const,
            id: "rep_performance",
            uri: "rep_performance",
            ref: idRef("rep_performance", "computedAttribute"),
            title: "Rep performance",
            description: "",
            production: true,
            deprecated: false,
            unlisted: false,
            attribute: idRef("rep_performance", "computedAttribute"),
        };
        const computedAttribute: CatalogItem = {
            type: "computedAttribute",
            groups: [],
            computedAttribute: {
                type: "computedAttribute",
                ref: idRef("rep_performance", "computedAttribute"),
                id: "rep_performance",
                uri: "rep_performance",
                title: "Rep performance",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                expression: "SELECT 1",
                displayForms: [displayForm],
            },
            defaultDisplayForm: displayForm,
            displayForms: [displayForm],
        };

        it("should filter-in a computed attribute when its own ref matches", () => {
            const result = filterAvailableItems(
                [idRef("rep_performance", "computedAttribute")],
                [computedAttribute],
            );

            expect(result).toEqual([computedAttribute]);
        });

        it("should filter-out a computed attribute the response does not mention", () => {
            expect(filterAvailableItems([idRef("of_activities", "measure")], [computedAttribute])).toEqual(
                [],
            );
        });

        describe("the validObjects query", () => {
            const computeValidObjects = ActionsApi_ComputeValidObjects as Mock;
            const authCall = (fn: (client: any) => any) => fn({ axios: {}, basePath: "" });

            const loadAvailableItems = (types: CatalogItemType[]) =>
                new TigerWorkspaceCatalogAvailableItemsFactory(
                    authCall as any,
                    "workspace",
                    [],
                    [computedAttribute],
                    {
                        types,
                        excludeTags: [],
                        includeTags: [],
                        loadGroups: false,
                        items: [newAttribute("region")],
                    },
                ).load();

            const sentQuery = () => computeValidObjects.mock.calls[0][2].afmValidObjectsQuery;

            beforeEach(() => {
                computeValidObjects.mockReset();
                // the action answers with the computed attribute itself - what it could not do
                // before it learned to evaluate them
                computeValidObjects.mockResolvedValue({
                    data: { items: [{ id: "rep_performance", type: "computedAttribute" }] },
                });
            });

            it("should ask the action for computed attributes by their own type", async () => {
                await loadAvailableItems(["computedAttribute"]);

                expect(sentQuery().types).toEqual(["computedAttributes"]);
            });

            it("should take the computed attribute from the RESPONSE, not pass it through", async () => {
                const result = await loadAvailableItems(["computedAttribute"]);

                // exactly once: a pass-through on top of the response would duplicate it
                expect(result.availableComputedAttributes()).toEqual([computedAttribute]);
            });

            it("should not ask for computed attributes when they were not requested", async () => {
                await loadAvailableItems(["attribute"]);

                expect(sentQuery().types).toEqual(["attributes"]);
            });
        });
    });

    describe("sanitizeFiltersForValidObjects", () => {
        const measureA = newMeasure("measure.a");
        const measureB = newMeasure("measure.b");
        const attributeA = newAttribute("attribute.a");

        const attributeLocalIds = new Set([attributeLocalId(attributeA)]);
        const measureLocalIds = new Set([measureLocalId(measureA), measureLocalId(measureB)]);

        const comparisonCondition = {
            comparison: {
                operator: "GREATER_THAN" as const,
                value: 10,
            },
        };

        const buildMvf = (overrides: Partial<IMeasureValueFilter>): IMeasureValueFilter => ({
            measureValueFilter: {
                measure: localIdRef(measureLocalId(measureA)),
                dimensionality: [localIdRef(attributeLocalId(attributeA))],
                condition: comparisonCondition,
                ...(overrides.measureValueFilter ?? {}),
            },
        });

        const buildRankingFilter = (overrides: Partial<IRankingFilter>): IRankingFilter => ({
            rankingFilter: {
                measure: localIdRef(measureLocalId(measureA)),
                attributes: [localIdRef(attributeLocalId(attributeA))],
                operator: "TOP",
                value: 5,
                ...(overrides.rankingFilter ?? {}),
            },
        });

        it("keeps filters referencing known local identifiers", () => {
            const filters: IMeasureValueFilter[] = [buildMvf({})];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual(
                filters,
            );
        });

        it("drops MVF referencing unknown measure", () => {
            const filters: IMeasureValueFilter[] = [
                buildMvf({
                    measureValueFilter: {
                        measure: localIdRef("missingMeasure"),
                        dimensionality: [localIdRef(attributeLocalId(attributeA))],
                        condition: comparisonCondition,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual([]);
        });

        it("drops MVF referencing unknown dimensionality attribute", () => {
            const filters: IMeasureValueFilter[] = [
                buildMvf({
                    measureValueFilter: {
                        measure: localIdRef(measureLocalId(measureA)),
                        dimensionality: [localIdRef("missingAttribute")],
                        condition: comparisonCondition,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual([]);
        });

        it("drops MVF referencing unknown dimensionality attribute defined as string", () => {
            const filters: IMeasureValueFilter[] = [
                buildMvf({
                    measureValueFilter: {
                        measure: localIdRef(measureLocalId(measureA)),
                        dimensionality: ["missingAttribute"] as unknown as ObjRefInScope[],
                        condition: comparisonCondition,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual([]);
        });

        it("drops ranking filters referencing unknown measure", () => {
            const filters: IRankingFilter[] = [
                buildRankingFilter({
                    rankingFilter: {
                        measure: localIdRef("missingMeasure"),
                        attributes: [localIdRef(attributeLocalId(attributeA))],
                        operator: "TOP",
                        value: 5,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual([]);
        });

        it("drops ranking filters referencing unknown attributes", () => {
            const filters: IRankingFilter[] = [
                buildRankingFilter({
                    rankingFilter: {
                        measure: localIdRef(measureLocalId(measureA)),
                        attributes: [localIdRef("missingAttribute")],
                        operator: "TOP",
                        value: 5,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual([]);
        });

        it("drops ranking filters referencing unknown attributes defined as string", () => {
            const filters: IRankingFilter[] = [
                buildRankingFilter({
                    rankingFilter: {
                        measure: localIdRef(measureLocalId(measureA)),
                        attributes: ["missingAttribute"] as unknown as ObjRefInScope[],
                        operator: "TOP",
                        value: 5,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual([]);
        });

        it("keeps filters using ObjRefs for dimensionality", () => {
            const filters: IRankingFilter[] = [
                buildRankingFilter({
                    rankingFilter: {
                        measure: localIdRef(measureLocalId(measureA)),
                        attributes: [idRef("someAttribute")],
                        operator: "TOP",
                        value: 5,
                    },
                }),
            ];

            expect(sanitizeFiltersForValidObjects(filters, attributeLocalIds, measureLocalIds)).toEqual(
                filters,
            );
        });
    });
});
