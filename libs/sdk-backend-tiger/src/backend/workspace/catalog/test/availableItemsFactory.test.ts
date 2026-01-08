// (C) 2019-2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { ReferenceRecordings } from "@gooddata/reference-workspace";
import {
    type CatalogItem,
    type IMeasureValueFilter,
    type IRankingFilter,
    type ObjRefInScope,
    attributeLocalId,
    idRef,
    localIdRef,
    measureLocalId,
    newAttribute,
    newMeasure,
    uriRef,
} from "@gooddata/sdk-model";

import { filterAvailableItems, sanitizeFiltersForValidObjects } from "../availableItemsFactory.js";

describe("available item filtering", () => {
    describe("item filtering", () => {
        /*
         * Note: reference workspace is created from bear. The 'refs' are thus UriRefs as that's what bear returns;
         * the filtering must thus use uriRefs for available items.
         *
         * This does not diminish the benefit of those tests as they do not verify ref matching itself but rather
         * whether simple objects or composite objects are filtered in correctly.
         */
        const AllItems: CatalogItem[] = ReferenceRecordings.Recordings.metadata!.catalog!.items;

        it("should return empty result if none match", () => {
            expect(filterAvailableItems([uriRef("nonsense")], AllItems)).toEqual([]);
        });
        it("should filter-in simple object if ref matches", () => {
            expect(
                filterAvailableItems([uriRef("/gdc/md/referenceworkspace/obj/1267")], AllItems),
            ).toMatchSnapshot();
        });

        it("should filter-in date dataset if attribute ref matches", () => {
            expect(
                filterAvailableItems([uriRef("/gdc/md/referenceworkspace/obj/827")], AllItems),
            ).toMatchSnapshot();
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
