// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectAttribute = createSelector(selectState, (state) => state.attribute);

/**
 * @internal
 */
export const selectAttributeStatus = createSelector(selectState, (state) => state.attributeStatus);

/**
 * @internal
 */
export const selectAttributeError = createSelector(selectState, (state) => state.attributeError);
