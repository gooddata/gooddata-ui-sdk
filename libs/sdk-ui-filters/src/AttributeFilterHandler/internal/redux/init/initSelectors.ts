// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { selectState } from "../common/selectors";

/**
 * @internal
 */
export const selectInitStatus = createSelector(selectState, (state) => state.initialization.status);

/**
 * @internal
 */
export const selectInitError = createSelector(selectState, (state) => state.initialization.error);
