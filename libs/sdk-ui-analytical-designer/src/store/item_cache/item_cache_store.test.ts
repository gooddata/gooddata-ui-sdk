// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { setDateDatasetsMeta, updateItemCache } from "../../actions/data_actions.js";
import { type IDateDatasetsMeta } from "../../models/date_datasets_meta.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { initialState } from "../../reducers/initial_state.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { withData } from "../../tests/state_builder.test.helpers.js";
import {
    type ICacheItem,
    type ICacheItemDisplayForm,
    type ICatalogEntries,
} from "../../typings/state_objects.js";

import { granularityCacheItems, mergeItemsIntoCache } from "./item_cache_helpers.js";
import { getItemCacheState } from "./item_cache_selectors.js";
import { itemCacheInitialState } from "./item_cache_state.js";

const item = (id: string, extra: Record<string, unknown> = {}): ICacheItem =>
    ({
        ref: { identifier: id },
        identifier: id,
        type: "metric",
        title: `Item ${id}`,
        ...extra,
    }) as ICacheItem;

const metaItem = (identifier: string, attributes: unknown[]): IDateDatasetsMeta["items"][0] =>
    ({
        identifier,
        uri: `/gdc/md/project/obj/${identifier}`,
        ref: uriRef(`/gdc/md/project/obj/${identifier}`),
        type: "dateDataset",
        title: identifier,
        summary: "",
        attributes,
    }) as IDateDatasetsMeta["items"][0];

describe("itemCache store", () => {
    it("self-initializes to an empty plain cache on the first action", () => {
        const state = combinedRootReducer(initialState, { type: "@@INIT" });

        expect(getItemCacheState(state)).toEqual({});
    });

    it("returns the initial state through the selector before the slice ever reduced", () => {
        expect(getItemCacheState(initialState)).toBe(itemCacheInitialState);
    });

    // Entries are PLAIN OBJECTS, which is what lets `getAttribute` spread them. Kind-checked, not
    // merely shape-checked.
    it("stores plain entries, so getAttribute can spread them", () => {
        const state = combinedRootReducer(
            getInitializedState(),
            updateItemCache({ "metric.m1": item("m1") }),
        );

        const entry = getItemCacheState(state)["metric.m1"];
        expect(entry).toEqual(item("m1"));
        expect({ ...entry, extra: 1 }.extra).toBe(1);
    });

    describe("STORE/UPDATE_ITEM_CACHE", () => {
        it("adds entries without touching the existing ones", () => {
            const first = combinedRootReducer(
                getInitializedState(),
                updateItemCache({ "metric.m1": item("m1") }),
            );
            const second = combinedRootReducer(first, updateItemCache({ "metric.m2": item("m2") }));

            expect(getItemCacheState(second)).toEqual({
                "metric.m1": item("m1"),
                "metric.m2": item("m2"),
            });
        });

        it("merges an entry field by field instead of replacing it", () => {
            const first = combinedRootReducer(
                getInitializedState(),
                updateItemCache({ "metric.m1": item("m1", { summary: "kept", format: "#" }) }),
            );
            const second = combinedRootReducer(
                first,
                updateItemCache({
                    "metric.m1": { title: "renamed" } as unknown as ICacheItem,
                }),
            );

            expect(getItemCacheState(second)["metric.m1"]).toEqual({
                ...item("m1", { summary: "kept", format: "#" }),
                title: "renamed",
            });
        });

        it("keeps the state reference when the merge changes nothing", () => {
            const first = combinedRootReducer(
                getInitializedState(),
                updateItemCache({ "metric.m1": item("m1") }),
            );

            const second = combinedRootReducer(first, updateItemCache({ "metric.m1": item("m1") }));

            expect(second).toBe(first);
        });

        it("keeps the root reference on unrelated actions (identity short-circuit)", () => {
            const state = getInitializedState();

            expect(combinedRootReducer(state, { type: "SOMETHING_ELSE" })).toBe(state);
        });
    });

    describe("SET_DATE_DATASETS_META fan-out", () => {
        const meta: IDateDatasetsMeta = {
            items: [
                metaItem("activity.dataset.dt", [
                    {
                        granularity: "activity.year",
                        dateType: "GDC.time.year",
                        title: "Year (Activity)",
                        displayForms: [{ identifier: "activity.year.df" }],
                    },
                ]),
            ],
        };

        it("merges the derived granularity entries into the cache", () => {
            const state = combinedRootReducer(getInitializedState(), setDateDatasetsMeta(meta));

            expect(getItemCacheState(state)["activity.year"]).toEqual({
                identifier: "activity.year",
                granularity: "activity.year",
                dateType: "GDC.time.year",
                title: "Year (Activity)",
                displayForms: [{ identifier: "activity.year.df" }],
            });
        });

        it("leaves catalog entries stored by UPDATE_ITEM_CACHE alone", () => {
            const withCatalog = combinedRootReducer(
                getInitializedState(),
                updateItemCache({ "metric.m1": item("m1") }),
            );

            const state = combinedRootReducer(withCatalog, setDateDatasetsMeta(meta));

            expect(getItemCacheState(state)["metric.m1"]).toEqual(item("m1"));
        });

        // relocated from services/test/date_datasets_meta_service.test.ts with the cache side
        // effect: the whole attribute is copied into the entry, keyed AND identified by its
        // granularity, display forms included
        it("copies the whole date attribute into the entry, keyed by granularity", () => {
            const attribute = {
                ref: { uri: "/gdc/md/TeamOneGoodSales1/obj/300" },
                granularity: "closed.day.in.week",
                dfRef: { uri: "/gdc/md/TeamOneGoodSales1/obj/301" },
                dfIdentifier: "closed.abK81lMifn6q",
                dfUri: "/gdc/md/TeamOneGoodSales1/obj/301",
                dateType: "GDC.time.day_in_week",
                uri: "/gdc/md/TeamOneGoodSales1/obj/300",
                title: "Day of Week (Closed)",
                displayForms: [
                    { id: "dfId", uri: "df/uri/", ref: { uri: "df/uri/" }, title: "Display form" },
                ],
            };

            const state = combinedRootReducer(
                getInitializedState(),
                setDateDatasetsMeta({ items: [metaItem("closed.dataset.dt", [attribute])] }),
            );

            expect(getItemCacheState(state)["closed.day.in.week"]).toEqual({
                ...attribute,
                identifier: "closed.day.in.week",
            });
        });

        it("does not touch the cache when the meta carries no attributes", () => {
            const state = getInitializedState();

            const next = combinedRootReducer(
                state,
                setDateDatasetsMeta({ items: [metaItem("activity.dataset.dt", [])] }),
            );

            // scoped to the cache: through the combined root the dateDatasetsMeta slice
            // legitimately stores the meta itself, so the ROOT reference is expected to change
            expect(getItemCacheState(next)).toBe(getItemCacheState(state));
        });
    });

    describe("mergeItemsIntoCache", () => {
        it("merges nested objects of an entry recursively", () => {
            const cache = { "metric.m1": { ref: { identifier: "m1" } } };

            const merged = mergeItemsIntoCache(cache, { "metric.m1": { ref: { uri: "/gdc/obj/1" } } });

            expect(merged["metric.m1"].ref).toEqual({ identifier: "m1", uri: "/gdc/obj/1" });
        });

        // List-valued entry fields must be REPLACED, not concatenated: every producer re-sends whole
        // entries, so concatenating doubles an attribute's displayForms on a second catalog load and
        // the "Display as" dropdown lists each one twice. lodash's own `merge` is not the alternative
        // either — it overlays BY INDEX and would keep a stale tail.
        it("REPLACES list-valued entry fields instead of concatenating them", () => {
            const cache: ICatalogEntries = {
                "attribute.a1": { displayForms: [{ id: "df1" } as ICacheItemDisplayForm] },
            };

            const merged = mergeItemsIntoCache(cache, {
                "attribute.a1": { displayForms: [{ id: "df1" }] },
            });

            expect(merged["attribute.a1"].displayForms).toEqual([{ id: "df1" }]);
        });

        it("REPLACES a longer cached list with a shorter incoming one, leaving no stale tail", () => {
            const cache: ICatalogEntries = {
                "attribute.a1": {
                    displayForms: [{ id: "df1" }, { id: "df2" }, { id: "df3" }] as ICacheItemDisplayForm[],
                },
            };

            const merged = mergeItemsIntoCache(cache, {
                "attribute.a1": { displayForms: [{ id: "df9" }] },
            });

            expect(merged["attribute.a1"].displayForms).toEqual([{ id: "df9" }]);
        });

        it("keeps the cached list when the incoming entry omits the field", () => {
            const cache: ICatalogEntries = {
                "attribute.a1": {
                    title: "A1",
                    displayForms: [{ id: "df1" }] as ICacheItemDisplayForm[],
                },
            };

            const merged = mergeItemsIntoCache(cache, { "attribute.a1": { title: "renamed" } });

            expect(merged["attribute.a1"].displayForms).toEqual([{ id: "df1" }]);
        });

        it("returns the same cache instance for an empty payload", () => {
            const cache = { "metric.m1": item("m1") };

            expect(mergeItemsIntoCache(cache, {})).toBe(cache);
        });

        // identity is re-established EXPLICITLY: a merge that allocates would dirty the subtree on
        // every dispatch. Asserted per ENTRY as well as per cache, because the memoized selectors
        // that hang off an entry care about the entry reference.
        it("keeps the cache AND the untouched entry references on a deep-equal merge", () => {
            const cache = { "metric.m1": item("m1"), "metric.m2": item("m2") };
            const entryBefore = cache["metric.m1"];

            const merged = mergeItemsIntoCache(cache, { "metric.m1": item("m1") });

            expect(merged).toBe(cache);
            expect(merged["metric.m1"]).toBe(entryBefore);
        });

        it("re-uses the entries it did not touch when another entry changes", () => {
            const cache = { "metric.m1": item("m1"), "metric.m2": item("m2") };

            const merged = mergeItemsIntoCache(cache, { "metric.m1": { title: "renamed" } });

            expect(merged).not.toBe(cache);
            expect(merged["metric.m2"]).toBe(cache["metric.m2"]);
        });
    });

    describe("granularityCacheItems", () => {
        it("keys every date attribute by its granularity and OMITS an absent displayForms", () => {
            const items = granularityCacheItems({
                items: [
                    metaItem("ds1", [{ granularity: "ds1.year", dateType: "GDC.time.year" }]),
                    metaItem("ds2", [
                        {
                            granularity: "ds2.month",
                            dateType: "GDC.time.month",
                            displayForms: [{ identifier: "df" }],
                        },
                    ]),
                ],
            });

            // toStrictEqual, so "key absent" is actually pinned — toEqual cannot tell it from
            // `displayForms: undefined`, and the distinction is the whole point below
            expect(items).toStrictEqual({
                "ds1.year": {
                    identifier: "ds1.year",
                    granularity: "ds1.year",
                    dateType: "GDC.time.year",
                },
                "ds2.month": {
                    identifier: "ds2.month",
                    granularity: "ds2.month",
                    dateType: "GDC.time.month",
                    displayForms: [{ identifier: "df" }],
                },
            });
        });

        // The `?? []` this replaced was harmless while arrays CONCATENATED — merging an empty list
        // in was a no-op. Once incoming arrays replace, it would wipe the display forms of a
        // granularity a previous payload populated, and the date bucket item's "Display as"
        // dropdown reads exactly this entry. Omitting the key keeps the no-op.
        it("does not wipe cached display forms when a later meta payload omits them", () => {
            const withForms = granularityCacheItems({
                items: [
                    metaItem("ds1", [
                        {
                            granularity: "ds1.month",
                            dateType: "GDC.time.month",
                            displayForms: [{ identifier: "df" }],
                        },
                    ]),
                ],
            });
            const withoutForms = granularityCacheItems({
                items: [metaItem("ds1", [{ granularity: "ds1.month", dateType: "GDC.time.month" }])],
            });

            const cache = mergeItemsIntoCache(itemCacheInitialState, withForms);
            const merged = mergeItemsIntoCache(cache, withoutForms);

            expect(merged["ds1.month"].displayForms).toEqual([{ identifier: "df" }]);
            // and the merge is a genuine no-op, so memoized readers do not recompute
            expect(merged).toBe(cache);
        });

        // deliberate hardening: a meta item without attributes must be skipped, not allowed to
        // break the accumulator for the next one
        it("skips meta items without attributes instead of throwing on the next one", () => {
            const items = granularityCacheItems({
                items: [
                    metaItem("ds1", undefined as unknown as unknown[]),
                    metaItem("ds2", [{ granularity: "ds2.year", dateType: "GDC.time.year" }]),
                ],
            });

            expect(Object.keys(items)).toEqual(["ds2.year"]);
        });

        it("returns nothing for empty meta", () => {
            expect(granularityCacheItems({ items: [] })).toEqual({});
        });
    });

    describe("coexistence with the remaining external writers (documented in item_cache_state.ts)", () => {
        it("picks up entries written straight into the subtree", () => {
            const external = withData(getInitializedState(), {
                itemCache: {
                    "attribute.a1": item("a1", { type: "attribute" }),
                },
            });

            const next = combinedRootReducer(external, updateItemCache({ "metric.m1": item("m1") }));

            expect(Object.keys(getItemCacheState(next))).toEqual(["attribute.a1", "metric.m1"]);
        });
    });
});
