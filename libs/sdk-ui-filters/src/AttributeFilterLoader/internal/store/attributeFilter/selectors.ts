// (C) 2021-2022 GoodData Corporation
import { filterAttributeElements, filterObjRef } from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectAttributeFilter = createSelector(selectState, (state) => state.attributeFilter);

/**
 * @internal
 */
export const selectAttributeFilterDisplayForm = createSelector(selectAttributeFilter, filterObjRef);

/**
 * @internal
 */
export const selectAttributeFilterElements = createSelector(selectAttributeFilter, filterAttributeElements);
