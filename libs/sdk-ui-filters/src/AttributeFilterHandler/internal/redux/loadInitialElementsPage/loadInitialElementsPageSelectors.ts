// (C) 2021-2023 GoodData Corporation
import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { selectState } from "../common/selectors.js";
import { FilterSelector } from "../common/types.js";
import { AsyncOperationStatus } from "../../../types/index.js";

/**
 * @internal
 */
export const selectLoadInitialElementsPageStatus: FilterSelector<AsyncOperationStatus> = createSelector(
    selectState,
    (state) => state.elements.initialPageLoad.status,
);

/**
 * @internal
 */
export const selectLoadInitialElementsPageError: FilterSelector<GoodDataSdkError> = createSelector(
    selectState,
    (state) => state.elements.initialPageLoad.error,
);
