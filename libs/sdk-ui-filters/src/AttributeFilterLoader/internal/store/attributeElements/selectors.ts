// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectAttributeElements = createSelector(selectState, (state) => state.attributeElements);
