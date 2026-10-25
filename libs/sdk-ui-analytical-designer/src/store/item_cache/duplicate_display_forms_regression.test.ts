// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { updateItemCache } from "../../actions/data_actions.js";
import { combinedRootReducer } from "../../reducers/combined_root_reducer.js";
import { getDisplayFormsForBucketItemSelector } from "../../selectors/buckets_selector.js";
import { getInitializedState } from "../../tests/state.test.helpers.js";
import { type IDecoratedBucketItem } from "../../typings/buckets.js";
import { type ICacheItem, type ICacheItemDisplayForm } from "../../typings/state_objects.js";

import { mergeItemsIntoCache } from "./item_cache_helpers.js";
import { itemCacheInitialState } from "./item_cache_state.js";

/**
 * Regression: the bucket item's "Display as" dropdown listed every display form once per catalog
 * load ("Product Name, Product, Product Link, Product Image" three times over for an attribute in
 * a line chart's Trend by bucket).
 *
 * The cause is in the itemCache write path, not in the dropdown: if `mergeItemsIntoCache`
 * CONCATENATES array-valued entry fields, each additional load grows `displayForms` by its own
 * length, because every producer re-sends whole entries. End-to-end here, because a unit-level pin on
 * the helper alone can stay green while the app is wrong.
 */

const displayForm = (id: string, title: string): ICacheItemDisplayForm => ({
    title,
    id,
    ref: { identifier: id },
    uri: `/gdc/md/project/obj/${id}`,
});

// what OrganizedCatalogUtils.convertToItemCacheMap produces for the Product attribute
const productEntry: ICacheItem = {
    ref: { identifier: "attr.product" },
    identifier: "attr.product",
    uri: "/gdc/md/project/obj/attr.product",
    type: "attribute",
    title: "Product",
    displayForms: [
        displayForm("label.product.name", "Product Name"),
        displayForm("label.product", "Product"),
        displayForm("label.product.link", "Product Link"),
        displayForm("label.product.image", "Product Image"),
    ],
};

const catalogPayload = { "attribute.attr.product": productEntry };

describe("duplicate display forms in the bucket item dropdown", () => {
    it("keeps displayForms stable when the same catalog entry is merged repeatedly", () => {
        let cache = itemCacheInitialState;

        for (let load = 0; load < 3; load++) {
            cache = mergeItemsIntoCache(cache, catalogPayload);
            expect(cache["attribute.attr.product"].displayForms).toHaveLength(4);
        }
    });

    it("answers exactly the four display forms after three catalog loads", () => {
        // three updateItemCache dispatches — e.g. the bootstrap catalog load, a route-params change
        // that flips the dataset, and open_report_sagas. combinedRootReducer is the root-level bridge
        // reducer, so it takes the whole root state.
        let state = combinedRootReducer(getInitializedState(), updateItemCache(catalogPayload));
        state = combinedRootReducer(state, updateItemCache(catalogPayload));
        state = combinedRootReducer(state, updateItemCache(catalogPayload));

        const bucketItem = { original: { attribute: "attr.product" } } as IDecoratedBucketItem;

        const displayForms = getDisplayFormsForBucketItemSelector(state, { bucketItem });

        expect(displayForms.map((df) => df.title)).toEqual([
            "Product Name",
            "Product",
            "Product Link",
            "Product Image",
        ]);
    });

    it("keeps the cache reference on a repeated merge, so memoized readers do not recompute", () => {
        const first = mergeItemsIntoCache(itemCacheInitialState, catalogPayload);

        expect(mergeItemsIntoCache(first, catalogPayload)).toBe(first);
    });
});
