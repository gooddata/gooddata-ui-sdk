// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";

import { selectState } from "../common/selectors";
import { selectLoadElementsOptions } from "../elements/elementsSelectors";
import { ILoadElementsOptions } from "../../../types";

/**
 * @internal
 */
export const selectLoadNextElementsPageStatus = createSelector(
    selectState,
    (state) => state.elements.nextPageLoad.status,
);

/**
 * @internal
 */
export const selectLoadNextElementsPageError = createSelector(
    selectState,
    (state) => state.elements.nextPageLoad.error,
);

/**
 * @internal
 */
export const selectLoadNextElementsPageOptions = createSelector(
    selectLoadElementsOptions,
    (options): ILoadElementsOptions => {
        return {
            ...options,
            offset: options.offset + options.limit,
        };
    },
);
