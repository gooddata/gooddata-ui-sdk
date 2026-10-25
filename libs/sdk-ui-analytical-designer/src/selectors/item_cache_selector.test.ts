// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type ObjRef } from "@gooddata/sdk-model";

import { initialState } from "../reducers/initial_state.js";
import { withData } from "../tests/state_builder.test.helpers.js";
import { type ICacheItem, type ICacheItemDisplayForm } from "../typings/state_objects.js";

import { getCacheItemByDisplayFormRef, getDisplayFormFromCacheByRef } from "./item_cache_selector.js";

describe("item cache selector test", () => {
    const dfRef: ObjRef = {
        uri: "/display/form/uri",
    };

    const displayForm: ICacheItemDisplayForm = {
        id: "dummy.display.form",
        uri: dfRef.uri,
        ref: dfRef,
        title: "Dummy display form",
        type: undefined,
    };

    const cacheItem: ICacheItem = {
        identifier: "dummy.cache.item",
        uri: "cache/item/uri",
        ref: {
            uri: "cache/item/uri",
        },
        title: "Dummy cache item",
        type: "attribute",
        displayForms: [displayForm],
    };
    // the cache is keyed `<type>.<identifier>`
    const stateWithCache = withData(initialState, {
        itemCache: {
            [`attribute.${cacheItem.identifier}`]: cacheItem,
        },
    });

    describe("getCacheItemByDisplayFormRef", () => {
        it("should return cache item having a referenced display form", () => {
            expect(getCacheItemByDisplayFormRef(stateWithCache, dfRef)).toEqual(cacheItem);
        });
    });

    describe("getDisplayFormFromCacheByRef", () => {
        it("should return referenced display form", () => {
            expect(getDisplayFormFromCacheByRef(stateWithCache, dfRef)).toEqual(displayForm);
        });
    });
});
