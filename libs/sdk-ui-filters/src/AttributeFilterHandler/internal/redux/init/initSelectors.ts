// (C) 2021-2025 GoodData Corporation
// in current version of @reduxjs/toolkit esm export are not defined
// we need direct import from esm module otherwise import ar not node compatible
// https://github.com/reduxjs/redux-toolkit/issues/1960
import { createSelector } from "@reduxjs/toolkit";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { selectState } from "../common/selectors.js";
import { FilterSelector } from "../common/types.js";
import { AsyncOperationStatus } from "../../../types/index.js";

/**
 * @internal
 */
export const selectInitStatus: FilterSelector<AsyncOperationStatus> = createSelector(
    selectState,
    (state) => state.initialization.status,
);

/**
 * @internal
 */
export const selectInitError: FilterSelector<GoodDataSdkError> = createSelector(
    selectState,
    (state) => state.initialization.error,
);
