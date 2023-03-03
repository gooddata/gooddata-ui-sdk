// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectAttribute = createSelector(selectState, (state) => state.attribute.data);

/**
 * @internal
 */
export const selectAttributeDataSet = createSelector(selectState, (state) => state.attribute.dataSet);

/**
 * @internal
 */
export const selectAttributeStatus = createSelector(selectState, (state) => state.attribute.status);

/**
 * @internal
 */
export const selectAttributeError = createSelector(selectState, (state) => state.attribute.error);
