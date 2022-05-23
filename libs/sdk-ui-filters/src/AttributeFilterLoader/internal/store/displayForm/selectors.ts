// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectDisplayForm = createSelector(selectState, (state) => state.displayForm);

/**
 * @internal
 */
export const selectDisplayFormAttributeRef = createSelector(selectDisplayForm, (state) => state.attribute);
