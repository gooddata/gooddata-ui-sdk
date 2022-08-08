// (C) 2021-2022 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";

import { selectState } from "../common/selectors";
import {
    selectElementsTotalCount,
    selectLastLoadedElementsOptions,
    selectLoadElementsOptions,
} from "../elements/elementsSelectors";
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
    selectLastLoadedElementsOptions,
    (options): ILoadElementsOptions => {
        return {
            ...options,
            offset: options.offset + options.limit,
        };
    },
);

/**
 * @internal
 */
export const selectHasNextPage = createSelector(
    selectLastLoadedElementsOptions,
    selectElementsTotalCount,
    (lastLoadedOptions, totalCount) => {
        return lastLoadedOptions.offset + lastLoadedOptions.limit < totalCount;
    },
);

/**
 * @internal
 */
export const selectIsLoadElementsOptionsChanged = createSelector(
    selectLoadElementsOptions,
    selectLastLoadedElementsOptions,
    (loadOptions, lastLoadedOptions) => {
        return !isEqual(omit(loadOptions, "offset"), omit(lastLoadedOptions, "offset"));
    },
);
