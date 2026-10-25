// (C) 2021-2026 GoodData Corporation

import { type ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";

import { getItemCacheState } from "../store/item_cache/item_cache_selectors.js";
import { type IAppState } from "../store/types.js";
import {
    type ICacheItemDisplayForm,
    type ICatalogEntries,
    type ICatalogEntry,
} from "../typings/state_objects.js";

export const getItemCache = (state: IAppState): ICatalogEntries => getItemCacheState(state);

export const getCacheItemByDisplayFormRef = (state: IAppState, dfRef: ObjRef): ICatalogEntry => {
    const cacheItem = Object.values(getItemCache(state)).find((cacheItem) =>
        cacheItem.displayForms?.find((displayForm) => areObjRefsEqual(displayForm.ref, dfRef)),
    );

    return cacheItem ?? null;
};

export const getDisplayFormFromCacheByRef = (state: IAppState, dfRef: ObjRef) => {
    const cacheItem = getCacheItemByDisplayFormRef(state, dfRef);

    return cacheItem?.displayForms.find((displayForm: ICacheItemDisplayForm) =>
        areObjRefsEqual(displayForm.ref, dfRef),
    );
};
