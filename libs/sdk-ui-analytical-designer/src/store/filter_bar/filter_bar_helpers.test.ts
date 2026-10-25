// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { DATE_DATASET_ATTRIBUTE } from "../../models/date_item.js";
import { dateDatasetRefsWithGranularities } from "../../tests/DateDatasetWithGranularities.test.helpers.js";
import {
    buildAttributeFilterMock,
    buildDateFilterMock,
    rankingFilterWithoutAttributes,
} from "../../tests/filter.test.helpers.js";

import {
    addFilter,
    createDateFilterIfDoesntExist,
    findAttributeFilter,
    findDateFilter,
    findRankingFilter,
    flattenDateDatasetAttributes,
    migrateAdditionalDateFilters,
    normalizeFilterBar,
    pickAdditionalDateAttributeFilters,
    pickAdditionalDateFiltersRemovedByMigration,
    removeAdditionalDateAttributeFilters,
    removeFilters,
    resetAdditionalDateFilters,
    storeAttributeFilterConfigs,
    storeAttributeFilterDisplayAsLabel,
    storeFilter,
    updateAttributeFilter,
    updateDateFilter,
    updateFilters,
} from "./filter_bar_helpers.js";
import { type IFilterBarState, defaultFilterBarState } from "./filter_bar_state.js";
import { type IAttributeFilter, type IDateFilterConfig, type IFilter } from "./filter_bar_types.js";

/**
 * The filter bar's NARROW PURE HELPERS. The whole-root adapters above them are covered end to end by
 * filter_bar_service.test.ts; what this suite pins is what only the value level can state:
 *
 * - the signature: one domain value in, one domain value out, foreign inputs as ARGUMENTS (the
 *   date-dataset attributes) and no store anywhere;
 * - the IDENTITY contract, including the two places that deliberately REBUILD unconditionally, so
 *   whoever wants to add a guard there can see exactly what changes;
 * - the additional-date-filter pair the selectors delegate to.
 */

const COUNTRY_FILTER: IAttributeFilter = buildAttributeFilterMock({
    cacheItemIdentifier: "attr.country.id",
    localIdentifier: "country.localId",
    displayFormRef: uriRef("/gdc/md/TeamOneGoodSales1/obj/902"),
});

/** a secondary label of the country attribute — what a "display as" config points at */
const DISPLAY_AS_REF = uriRef("/gdc/md/TeamOneGoodSales1/obj/903");

const DATE_FILTER: IFilter = buildDateFilterMock({
    cacheItemIdentifier: DATE_DATASET_ATTRIBUTE,
    localIdentifier: "date.localId",
});

const filterBarWith = (...items: IFilter[]): IFilterBarState => ({ ...defaultFilterBarState, items });

describe("filter bar helpers", () => {
    describe("the value-level signature", () => {
        it("adds a filter to the value it was given, leaving the input untouched", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER);

            const updated = addFilter(filterBar, DATE_FILTER);

            expect(updated.items).toEqual([COUNTRY_FILTER, DATE_FILTER]);
            expect(filterBar.items).toEqual([COUNTRY_FILTER]);
        });

        it("stores a filter by local identifier and answers the same value for an unknown one", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER);
            const renamed = { ...COUNTRY_FILTER, cacheItemIdentifier: "attr.other.id" };

            expect(storeFilter(filterBar, renamed).items).toEqual([renamed]);
            expect(storeFilter(filterBar, { ...renamed, localIdentifier: "not.there" }).items).toEqual([
                COUNTRY_FILTER,
            ]);
        });

        it("finds date / attribute / ranking filters without a store", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER, DATE_FILTER, rankingFilterWithoutAttributes);

            expect(findDateFilter(filterBar, "date.localId")).toBe(DATE_FILTER);
            expect(findAttributeFilter(filterBar, "country.localId")).toBe(COUNTRY_FILTER);
            expect(findRankingFilter(filterBar)).toBe(rankingFilterWithoutAttributes);
            expect(findDateFilter(filterBar, "nope")).toBe(undefined);
            // the ranking finder normalizes absence to null, which its readers rely on
            expect(findRankingFilter(filterBarWith(COUNTRY_FILTER))).toBe(null);
        });

        it("keeps ranking filters last, whichever writer produced the order", () => {
            const filterBar = filterBarWith(rankingFilterWithoutAttributes, COUNTRY_FILTER);

            expect(normalizeFilterBar(filterBar).items).toEqual([
                COUNTRY_FILTER,
                rankingFilterWithoutAttributes,
            ]);
            expect(addFilter(filterBarWith(rankingFilterWithoutAttributes), COUNTRY_FILTER).items).toEqual([
                COUNTRY_FILTER,
                rankingFilterWithoutAttributes,
            ]);
        });
    });

    describe("identity", () => {
        /**
         * The ONE identity guard in this family. Its premise matters: the guard compares the stored item against the item the update would write, and
         * the update always writes an `emptyDateValuesFilter` key and a `filterConfig` — so it can
         * only fire on an item a previous update produced. A REPEATED identical update is exactly
         * that case, and it is the one that happens in production (the date filter dropdown
         * re-committing the same interval).
         */
        it("answers the SAME value when the same date-filter update is repeated", () => {
            const filterConfig: IDateFilterConfig = {
                granularity: "GDC.time.year",
                interval: [0, 1],
            };
            const payload = {
                localIdentifier: "date.localId",
                filterConfig,
                overTimeComparisonType: DATE_FILTER.overTimeComparisonType,
                dateDatasetRef: DATE_FILTER.dateDatasetRef,
            };
            const initial = filterBarWith(DATE_FILTER);
            const filterBar = updateDateFilter(initial, payload);

            // premise: the first update DID write (otherwise the second one proves nothing)
            expect(filterBar).not.toBe(initial);
            expect(findDateFilter(filterBar, "date.localId").filterConfig).toEqual(payload.filterConfig);

            expect(updateDateFilter(filterBar, payload)).toBe(filterBar);
        });

        it("answers the SAME value when the date filter already exists", () => {
            const filterBar = filterBarWith(DATE_FILTER);

            expect(createDateFilterIfDoesntExist(filterBar, uriRef("/any"))).toBe(filterBar);
        });

        /**
         * `normalizeFilterBar` maps `items` unconditionally, so a no-op removal still produces a new
         * value. Pinned rather than guarded: adding a guard changes how often the store notifies,
         * and these two specs are what whoever wants that has to flip.
         */
        it("REBUILDS on a no-op removal", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER);

            const updated = removeFilters(filterBar, ["not.there"]);

            expect(updated).not.toBe(filterBar);
            expect(updated).toEqual(filterBar);
            expect(updated.items[0]).toBe(COUNTRY_FILTER);
        });

        it("REBUILDS on an unchanged attribute-filter-config write, as before", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER);

            const updated = storeAttributeFilterConfigs(filterBar, filterBar.attributeFilterConfigs);

            expect(updated).not.toBe(filterBar);
            expect(updated.attributeFilterConfigs).toBe(filterBar.attributeFilterConfigs);
        });

        /**
         * `attributeFilterConfigs` is typed NON-OPTIONAL, but open-report writes
         * `converted.content.attributeFilterConfigs`, which an insight carries only when it HAS a
         * display-as label. Without the coercion the field arrives here as `undefined`, the state
         * holds it, and the RAW readers then crash with "Cannot read properties of undefined". This
         * write boundary is what makes the declared type true.
         */
        it("COERCES an absent config map, so the state's non-optional field is never undefined", () => {
            const updated = storeAttributeFilterConfigs(filterBarWith(COUNTRY_FILTER), undefined);

            expect(updated.attributeFilterConfigs).toEqual({});
            expect(
                storeAttributeFilterDisplayAsLabel(updated, COUNTRY_FILTER.localIdentifier, DISPLAY_AS_REF)
                    .attributeFilterConfigs,
            ).toEqual({ [COUNTRY_FILTER.localIdentifier]: { displayAsLabel: DISPLAY_AS_REF } });
        });

        it("throws when the attribute filter to update is not there", () => {
            expect(() =>
                updateAttributeFilter(filterBarWith(DATE_FILTER), "country.localId", [], 0, false),
            ).toThrow(/country.localId/);
        });
    });

    describe("the additional date filters", () => {
        const dateAttributes = flattenDateDatasetAttributes(dateDatasetRefsWithGranularities);
        const DATE3_REF = { identifier: "DATE3", type: "dataSet" as const };
        const withSelection = {
            isInverted: false,
            totalElementsCount: 1,
            selectedElements: [{ title: "Q1", available: true, uri: "/gdc/md/1?id=1" }],
        };

        /** filtered by DATE1's quarter display form — DATE3 has a quarter, so it MIGRATES */
        const quarterFilter: IAttributeFilter = buildAttributeFilterMock({
            cacheItemIdentifier: "DATE1.quarter",
            localIdentifier: "additional.quarter",
            displayFormRef: { identifier: "DATE1.quarter", type: "displayForm" },
            filterConfig: withSelection,
        });
        /** filtered by DATE1's year display form — DATE3 has NO year, so it is REMOVED */
        const yearFilter: IAttributeFilter = buildAttributeFilterMock({
            cacheItemIdentifier: "DATE1.year",
            localIdentifier: "additional.year",
            displayFormRef: { identifier: "DATE1.year", type: "displayForm" },
            filterConfig: withSelection,
        });

        it("picks exactly the attribute filters that filter by a date dataset's own attribute", () => {
            const items = [COUNTRY_FILTER, DATE_FILTER, quarterFilter];

            expect(pickAdditionalDateAttributeFilters(items, dateAttributes)).toEqual([quarterFilter]);
        });

        it("removes exactly those, keeping every other filter in order", () => {
            const items = [COUNTRY_FILTER, DATE_FILTER, quarterFilter];

            expect(removeAdditionalDateAttributeFilters(items, dateAttributes)).toEqual([
                COUNTRY_FILTER,
                DATE_FILTER,
            ]);
        });

        it("replaces the whole additional set — the two halves are complementary", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER, quarterFilter);
            const replacement = { ...quarterFilter, localIdentifier: "replacement.localId" };

            const updated = updateFilters(filterBar, [replacement], dateAttributes);

            expect(updated.items).toEqual([COUNTRY_FILTER, replacement]);
        });

        it("takes the granularity list as an ARGUMENT: migrates what the new dataset has, drops the rest", () => {
            const filterBar = filterBarWith(COUNTRY_FILTER, quarterFilter, yearFilter);

            const updated = resetAdditionalDateFilters(
                filterBar,
                DATE3_REF,
                dateDatasetRefsWithGranularities,
            );

            // the quarter filter keeps its local identifier AND its selection and moves to DATE3's
            // quarter display form; the year filter is gone, because DATE3 has no year attribute
            expect(findAttributeFilter(updated, "additional.quarter")).toEqual({
                type: "attribute",
                localIdentifier: "additional.quarter",
                cacheItemIdentifier: "DATE3.quarter",
                displayFormRef: { identifier: "DATE3.quarter", type: "displayForm" },
                filterConfig: withSelection,
            });
            expect(findAttributeFilter(updated, "additional.year")).toBe(undefined);
            expect(updated.items).toContain(COUNTRY_FILTER);
            // only the removed one lost a selection, so only it is reported for the warning
            expect(updated.migratedAdditionalFilters).toEqual(["additional.year"]);
        });

        it("adds the removed filters to the ones an earlier change already removed", () => {
            // an earlier dimension change removed a filter that is no longer in the filter bar to be seen
            const filterBar = {
                ...filterBarWith(COUNTRY_FILTER, quarterFilter, yearFilter),
                migratedAdditionalFilters: ["additional.earlier"],
            };

            const updated = resetAdditionalDateFilters(
                filterBar,
                DATE3_REF,
                dateDatasetRefsWithGranularities,
            );

            expect(updated.migratedAdditionalFilters).toEqual(["additional.earlier", "additional.year"]);
        });

        describe("the migration pair the pickers share", () => {
            it("re-points a filter whose granularity the new dataset has, keeping its selection as is", () => {
                const migrated = migrateAdditionalDateFilters(
                    DATE3_REF,
                    [quarterFilter, yearFilter],
                    dateDatasetRefsWithGranularities,
                );

                expect(migrated).toEqual([
                    {
                        ...quarterFilter,
                        cacheItemIdentifier: "DATE3.quarter",
                        displayFormRef: { identifier: "DATE3.quarter", type: "displayForm" },
                    },
                ]);
                expect(migrated[0].filterConfig).toBe(quarterFilter.filterConfig);
            });

            it("reports a removed filter only when it carried a real selection", () => {
                const yearSelectingAll: IAttributeFilter = {
                    ...yearFilter,
                    localIdentifier: "additional.year.all",
                    filterConfig: { isInverted: true, totalElementsCount: 0, selectedElements: [] },
                };

                expect(
                    pickAdditionalDateFiltersRemovedByMigration(
                        DATE3_REF,
                        [quarterFilter, yearFilter, yearSelectingAll],
                        dateDatasetRefsWithGranularities,
                    ),
                ).toEqual(["additional.year"]);
            });
        });
    });
});
