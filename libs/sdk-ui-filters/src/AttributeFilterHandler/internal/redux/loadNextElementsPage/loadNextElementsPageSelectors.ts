// (C) 2021-2024 GoodData Corporation
import { GoodDataSdkError } from "@gooddata/sdk-ui";
import { createSelector } from "@reduxjs/toolkit";
import isEqual from "lodash/isEqual.js";
import omit from "lodash/omit.js";

import { selectState } from "../common/selectors.js";
import {
    selectElementsTotalCountWithCurrentSettings,
    selectLastLoadedElementsOptions,
    selectLoadElementsOptions,
} from "../elements/elementsSelectors.js";
import { AsyncOperationStatus, ILoadElementsOptions } from "../../../types/index.js";
import { FilterSelector } from "../common/types.js";

/**
 * @internal
 */
export const selectLoadNextElementsPageStatus: FilterSelector<AsyncOperationStatus> = createSelector(
    selectState,
    (state) => state.elements.nextPageLoad.status,
);

/**
 * @internal
 */
export const selectLoadNextElementsPageError: FilterSelector<GoodDataSdkError> = createSelector(
    selectState,
    (state) => state.elements.nextPageLoad.error,
);

/**
 * @internal
 */
export const selectLoadNextElementsPageOptions: FilterSelector<ILoadElementsOptions> = createSelector(
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
export const selectHasNextPage: FilterSelector<boolean> = createSelector(
    selectLastLoadedElementsOptions,
    selectElementsTotalCountWithCurrentSettings,
    (lastLoadedOptions, totalCountWithCurrentSettings) => {
        return lastLoadedOptions.offset + lastLoadedOptions.limit < totalCountWithCurrentSettings;
    },
);

/**
 * @internal
 */
export const selectIsLoadElementsOptionsChanged: FilterSelector<boolean> = createSelector(
    selectLoadElementsOptions,
    selectLastLoadedElementsOptions,
    (loadOptions, lastLoadedOptions) => {
        return !isEqual(
            // omit offset as it changes for each page
            // omit options which can not be set externally by user and thus are not stored in state
            omit(loadOptions, "offset", "excludePrimaryLabel", "filterByPrimaryLabel"),
            omit(lastLoadedOptions, "offset", "excludePrimaryLabel", "filterByPrimaryLabel"),
        );
    },
);
